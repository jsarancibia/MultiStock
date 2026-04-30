import Image from "next/image";
import { BRAND_LOGOS } from "@/config/brand-assets";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  alt?: string;
  className?: string;
  fit?: "contain" | "cover";
  priority?: boolean;
  sizes?: string;
  tone?: "auto" | "light" | "dark";
};

export function BrandLogo({
  alt = "MultiStock",
  className,
  fit = "contain",
  priority = false,
  sizes = "96px",
  tone = "auto",
}: BrandLogoProps) {
  const fitClass = fit === "cover" ? "object-cover" : "object-contain";

  if (tone !== "auto") {
    const logo = BRAND_LOGOS[tone];

    return (
      <span className={cn("relative inline-block overflow-hidden", className)}>
        <Image
          src={logo.src}
          alt={alt}
          fill
          sizes={sizes}
          className={fitClass}
          priority={priority}
        />
      </span>
    );
  }

  return (
    <span className={cn("relative inline-block overflow-hidden", className)}>
      <Image
        src={BRAND_LOGOS.light.src}
        alt={alt}
        fill
        sizes={sizes}
        className={cn(fitClass, "dark:hidden")}
        priority={priority}
      />
      <Image
        src={BRAND_LOGOS.dark.src}
        alt={alt}
        fill
        sizes={sizes}
        className={cn("hidden dark:block", fitClass)}
        priority={priority}
      />
    </span>
  );
}

