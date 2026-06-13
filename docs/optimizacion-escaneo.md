# Optimización de Escaneo de Códigos de Barras en Móvil / Tablet

## Problema Raíz

`decodeFromVideoDevice()` solo envía `{ facingMode: 'environment' }` al navegador. Sin constraints de resolución, frameRate ni torch. La cámara usa los defaults del sistema — en muchos dispositivos **640×480 con autofocus lento**.

---

## Plan de Cambios (5 puntos)

### 1. Cambiar entry point: `decodeFromVideoDevice` → `decodeFromConstraints`

`decodeFromVideoDevice` hardcodea `{ facingMode: 'environment' }` y no permite resolution/frameRate.
`decodeFromConstraints` acepta `MediaStreamConstraints` completos.

| Antes | Después |
|---|---|
| `reader.decodeFromVideoDevice(deviceId, video, cb)` | `reader.decodeFromConstraints(cloneConstraints(deviceId), video, cb)` |

**Helper para construir constraints:**

```ts
function buildConstraints(deviceId: string | undefined): MediaStreamConstraints {
  const supported = navigator.mediaDevices.getSupportedConstraints();
  const video: MediaTrackConstraints = {
    width: { min: 640, ideal: 1920, max: 1920 },
    height: { min: 480, ideal: 1080, max: 1080 },
    frameRate: { ideal: 30, max: 30 },
  };
  if (deviceId) {
    video.deviceId = { exact: deviceId };
  } else {
    video.facingMode = { ideal: "environment" };
  }
  if (supported.focusMode) {
    (video as Record<string, unknown>).focusMode = "continuous";
  }
  return { video, audio: false };
}
```

### 2. Agregar torch (flash) automático en baja luz

Como beneficio colateral de usar `decodeFromConstraints`, el objeto `controls` expone `switchTorch`. Se puede prender al abrir el scanner y apagar al cerrar:

```ts
// En el .then((controls) => ...)
if (controls.switchTorch) {
  controls.switchTorch(true).catch(() => {});
}
```

### 3. Reducir `delayBetweenScanAttempts` de 200 → 100

Acorta la espera entre frames fallidos. Se pasa en el constructor del reader:

```ts
const reader = new BrowserMultiFormatOneDReader(undefined, {
  delayBetweenScanAttempts: 100,  // antes: 200
  delayBetweenScanSuccess: 200,   // antes: 200
});
```

### 4. Restringir formatos (opcional — ganancia marginal con `OneDReader`)

`BrowserMultiFormatOneDReader` ya solo usa readers 1D. Para excluir formatos que no uses (ej. Codabar, RSS-14), pasar hints:

```ts
import { DecodeHintType, BarcodeFormat } from "@zxing/library";

const hints = new Map([
  [DecodeHintType.POSSIBLE_FORMATS, [
    BarcodeFormat.EAN_13,
    BarcodeFormat.EAN_8,
    BarcodeFormat.UPC_A,
    BarcodeFormat.UPC_E,
    BarcodeFormat.CODE_128,
    BarcodeFormat.CODE_39,
  ]],
]);
const reader = new BrowserMultiFormatOneDReader(hints, { ... });
```

### 5. Compatibilidad con el switch de cámara

`decodeFromConstraints` acepta `deviceId: { exact: id }` igual que lo hacía `decodeFromVideoDevice`. El switch actual (estado `currentDeviceId`) se conserva intacto — solo cambia cómo se pasa al reader.

---

## Vista previa del diff principal (efecto reescrito)

```ts
// Antes
reader.decodeFromVideoDevice(currentDeviceId, video, callback)
  .then((controls) => {
    controlsRef.current = controls;
    setStatus("scanning");
    BrowserCodeReader.listVideoInputDevices()
      .then((cameras) => { if (!cancelled) setVideoDevices(cameras); })
      .catch(() => {});
  })
  .catch((err) => {
    // manejo de errores...
  });

// Después
reader.decodeFromConstraints(buildConstraints(currentDeviceId), video, callback)
  .then((controls) => {
    controlsRef.current = controls;
    setStatus("scanning");
    if (controls.switchTorch) {
      controls.switchTorch(true).catch(() => {});
    }
    BrowserCodeReader.listVideoInputDevices()
      .then((cameras) => { if (!cancelled) setVideoDevices(cameras); })
      .catch(() => {});
  })
  .catch((err) => {
    // manejo de errores...
  });
```

---

## Notas de compatibilidad

| Feature | Chrome Android | iOS Safari | Firefox |
|---|---|---|---|
| `width: { ideal: 1920 }` | ✅ | ✅ | ✅ |
| `focusMode: 'continuous'` | ✅ | ❌ (silencioso) | ❌ |
| `torch` (via `switchTorch`) | ✅ | Parcial | ❌ |
| `deviceId: { exact: id }` | ✅ | ✅ | ✅ |
