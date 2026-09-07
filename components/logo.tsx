import Image from "next/image";
import Link from "next/link";

const MARK_SRC = "/icons/icon-192.png";

export function LogoMark({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <Image
      src={MARK_SRC}
      alt=""
      width={size}
      height={size}
      priority
      className={`rounded-[22%] ${className}`}
    />
  );
}

export function Logo({
  size = 24,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <LogoMark size={size} />
      <span className="text-sm font-semibold tracking-tight text-foreground">netgauge</span>
    </Link>
  );
}
