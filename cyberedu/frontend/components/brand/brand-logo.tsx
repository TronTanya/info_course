import Link from "next/link";
import { focusRing } from "@/lib/design-system/primitives";
import { cn } from "@/lib/utils";

export const BRAND_MARK_SRC = "/brand/logo-mark.svg";
export const BRAND_FULL_SRC = "/brand/logo-full.svg";

type BrandLogoMarkProps = {
  className?: string;
  /** Логический размер в px (атрибуты width/height для CLS) */
  size?: number;
};

/** Компактный знак: щит, C, траектория, книга, искра AI. */
export function BrandLogoMark({ className, size = 40 }: BrandLogoMarkProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- локальный векторный марк
    <img
      src={BRAND_MARK_SRC}
      width={size}
      height={size}
      alt=""
      aria-hidden
      className={cn("shrink-0 object-contain select-none", className)}
    />
  );
}

type BrandLogoFullImgProps = {
  className?: string;
};

/** Горизонтальный логотип (SVG с текстом). */
export function BrandLogoFullImg({ className }: BrandLogoFullImgProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={BRAND_FULL_SRC}
      width={300}
      height={52}
      alt="CyberEdu — информационная безопасность"
      className={cn("h-11 w-auto max-w-[min(100%,300px)] object-contain object-left sm:h-12", className)}
    />
  );
}

type BrandLogoHeaderLinkProps = {
  className?: string;
  /** Только знак (например узкий мобильный режим) */
  iconOnly?: boolean;
};

/** Шапка сайта: знак + название + подпись. */
export function BrandLogoHeaderLink({ className, iconOnly }: BrandLogoHeaderLinkProps) {
  return (
    <Link href="/" className={cn("flex min-w-0 items-center gap-2.5 rounded-xl sm:gap-3", focusRing, className)}>
      <BrandLogoMark className="h-9 w-9 sm:h-10 sm:w-10" size={40} />
      {iconOnly ? (
        <span className="sr-only">CyberEdu — информационная безопасность</span>
      ) : (
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-base font-semibold tracking-tight text-foreground">CyberEdu</span>
          <span className="hidden truncate text-xs text-muted-foreground sm:block sm:text-[13px]">
            Информационная безопасность
          </span>
        </span>
      )}
    </Link>
  );
}
