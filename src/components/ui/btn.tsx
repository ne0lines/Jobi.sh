"use client"

import type { LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { trackButtonEvent, type TrackableEvent } from '@/lib/analytics'

type BtnVariant = "primary" | "secondary" | "tertiary" | "red" | "muted";
type BtnIconPosition = "left" | "right";

type BtnIcon = {
  component: LucideIcon
  className?: string
  position?: BtnIconPosition
  size?: number
  strokeWidth?: number
}

type BtnIconProp = BtnIcon | LucideIcon

type SharedProps = {
  children: React.ReactNode
  className?: string
  fullWidth?: boolean
  hex?: string
  icon?: BtnIconProp
  style?: React.CSSProperties
  track?: TrackableEvent
  variant?: BtnVariant
}

type LinkBtnProps = SharedProps & {
  href: string;
  target?: React.HTMLAttributeAnchorTarget;
  rel?: string;
};

type ButtonBtnProps = SharedProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
  };

type BtnProps = LinkBtnProps | ButtonBtnProps;

const baseClassName =
  "inline-flex min-h-14 items-center justify-center rounded-2xl px-5 text-base font-semibold transition duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary/40 disabled:pointer-events-none disabled:opacity-60 cursor-pointer";

const variantClassNames: Record<BtnVariant, string> = {
  primary:
    "bg-[linear-gradient(90deg,#6e33eb_0%,#8148ff_100%)] text-white shadow-[0_10px_22px_rgba(110,51,235,0.26)] visited:text-white",
  secondary: "border border-app-stroke bg-white/70 text-app-ink",
  tertiary:
    "bg-[linear-gradient(90deg,#1f7a43_0%,#1f7a43_100%)] text-white shadow-[0_10px_22px_rgba(31,122,67,0.22)] visited:text-white",
  muted:
    "border border-app-stroke bg-app-muted-surface text-app-muted-ink hover:bg-app-muted-hover",
  red: "bg-[linear-gradient(90deg,#ff4d4f_0%,#d32f2f_100%)] text-white shadow-[0_10px_22px_rgba(211,47,47,0.22)] visited:text-white",
};

function cn(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(" ");
}

function normalizeHexColor(hex: string): string | null {
  const trimmedHex = hex.trim();

  if (/^#([0-9a-f]{3}){1,2}$/i.test(trimmedHex)) {
    return trimmedHex;
  }

  return null;
}

function getContrastTextColor(hex: string): string {
  const normalizedHex = hex.replace("#", "");
  const expandedHex =
    normalizedHex.length === 3
      ? normalizedHex
        .split("")
        .map((character) => `${character}${character}`)
        .join("")
      : normalizedHex;

  const red = Number.parseInt(expandedHex.slice(0, 2), 16);
  const green = Number.parseInt(expandedHex.slice(2, 4), 16);
  const blue = Number.parseInt(expandedHex.slice(4, 6), 16);
  const brightness = (red * 299 + green * 587 + blue * 114) / 1000;

  return brightness > 160 ? "#111728" : "#ffffff";
}

function normalizeBtnIcon(icon?: BtnIconProp): BtnIcon | undefined {
  if (!icon) {
    return undefined;
  }

  if (typeof icon === 'function') {
    return {
      component: icon,
      position: 'left',
      size: 18,
    }
  }

  if (typeof icon === 'object' && 'component' in icon) {
    return icon
  }

  if (typeof icon === 'object') {
    return {
      component: icon as LucideIcon,
      position: 'left',
      size: 18,
    }
  }

  return undefined
}

export function Btn({
  children,
  className,
  fullWidth = false,
  hex,
  icon,
  style,
  track,
  variant = "primary",
  ...props
}: BtnProps) {
  const normalizedHex = hex ? normalizeHexColor(hex) : null
  const classes = cn(
    baseClassName,
    variantClassNames[variant],
    normalizedHex ? "bg-none" : false,
    fullWidth && "w-full",
    className,
  );
  const resolvedStyle = normalizedHex
    ? {
        ...style,
        backgroundColor: normalizedHex,
        backgroundImage: 'none',
        borderColor: normalizedHex,
        color: getContrastTextColor(normalizedHex),
      }
    : style
  const resolvedIcon = normalizeBtnIcon(icon)
  const iconPosition = resolvedIcon?.position ?? 'left'
  const iconSize = resolvedIcon?.size ?? 18
  const Icon = resolvedIcon?.component
  let iconElement: React.ReactNode = null

  if (resolvedIcon && Icon) {
    iconElement = (
      <Icon
        aria-hidden='true'
        className={cn('shrink-0', resolvedIcon.className)}
        size={iconSize}
        strokeWidth={resolvedIcon.strokeWidth ?? 2.2}
      />
    );
  }

  const content = (
    <span className="inline-flex items-center gap-2">
      {iconPosition === "left" ? iconElement : null}
      <span>{children}</span>
      {iconPosition === "right" ? iconElement : null}
    </span>
  );

  if (typeof props.href === "string") {
    const { href, rel, target } = props;
    const isExternal =
      href.startsWith("http://") || href.startsWith("https://");

    if (isExternal) {
      return (
        <a
          className={classes}
          href={href}
          rel={rel}
          style={resolvedStyle}
          target={target}
          onClick={() => { if (track) trackButtonEvent(track); }}
        >
          {content}
        </a>
      );
    }

    return (
      <Link
        className={classes}
        href={href}
        style={resolvedStyle}
        onClick={() => { if (track) trackButtonEvent(track); }}
      >
        {content}
      </Link>
    );
  }

  const { onClick, ...buttonProps } = props as ButtonBtnProps;
  return (
    <button
      className={classes}
      style={resolvedStyle}
      {...buttonProps}
      onClick={(e) => {
        if (track) trackButtonEvent(track);
        onClick?.(e);
      }}
    >
      {content}
    </button>
  );
}
