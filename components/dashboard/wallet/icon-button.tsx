"use client";

interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ElementType;
  href?: string;
}

export default function IconButton({
  icon: Icon,
  href,
  ...rest
}: IconButtonProps) {
  const inner = (
    <button
      {...rest}
      className="p-1 rounded-md transition-all hover:bg-white/10"
    >
      <Icon className="h-4 w-4 text-white/80" />
    </button>
  );

  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="p-1 rounded-md transition-all hover:bg-white/10"
    >
      <Icon className="h-4 w-4 text-white/80" />
    </a>
  ) : (
    inner
  );
}
