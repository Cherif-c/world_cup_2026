import Image from "next/image";
import { getFlagUrl } from "@/lib/teams";

interface TeamFlagProps {
  team: string;
  size?: number;
  className?: string;
}

export function TeamFlag({ team, size = 40, className = "" }: TeamFlagProps) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full ring-2 ring-white/10 shadow-lg ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={getFlagUrl(team, size * 2)}
        alt={`Drapeau ${team}`}
        fill
        className="object-cover"
        sizes={`${size}px`}
      />
    </div>
  );
}
