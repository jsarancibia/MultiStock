import { cookies } from "next/headers";

export const ACTIVE_BUSINESS_COOKIE = "multistock_active_business_id";

export async function getActiveBusinessIdFromCookie(): Promise<string | null> {
  const store = await cookies();
  return store.get(ACTIVE_BUSINESS_COOKIE)?.value ?? null;
}

export async function setActiveBusinessCookie(businessId: string) {
  const store = await cookies();
  store.set(ACTIVE_BUSINESS_COOKIE, businessId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}
