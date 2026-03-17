import Link from "next/link";

type BtnVariant = "primary" | "secondary" | "tertiary" | "muted";

type SharedProps = {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
  variant?: BtnVariant;
};

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
  "inline-flex min-h-14 items-center justify-center rounded-2xl px-5 text-base font-semibold transition duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary/40 disabled:pointer-events-none disabled:opacity-60";

const variantClassNames: Record<BtnVariant, string> = {
  primary:
    "bg-gradient-to-r from-app-primary to-app-primary-strong text-white shadow-lg visited:text-white",
  secondary:
    "border border-app-stroke bg-white/70 text-app-ink",
  tertiary:
    "bg-gradient-to-r from-app-green-strong to-app-green-strong text-white shadow-lg visited:text-white",
  muted:
    "border border-app-stroke bg-app-muted-surface text-app-muted-ink hover:bg-app-muted-hover",
};

function cn(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(" ");
}

export function Btn({
  children,
  className,
  fullWidth = false,
  variant = "primary",
  ...props
}: BtnProps) {
  const classes = cn(
    baseClassName,
    variantClassNames[variant],
    fullWidth && "w-full",
    className,
  );

  if (typeof props.href === "string") {
    const { href, rel, target } = props;
    const isExternal = href.startsWith("http://") || href.startsWith("https://");

    if (isExternal) {
      return (
        <a className={classes} href={href} rel={rel} target={target}>
          {children}
        </a>
      );
    }

    return (
      <Link className={classes} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
