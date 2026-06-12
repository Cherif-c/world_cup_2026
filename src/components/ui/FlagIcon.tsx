import { getFlagUrl } from "@/lib/teams";

interface FlagIconProps {
  team: string;
  size?: number;
  className?: string;
}

export function FlagIcon({ team, size = 24, className = "" }: FlagIconProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={getFlagUrl(team)}
      alt=""
      width={size}
      height={Math.round(size * 0.75)}
      loading="lazy"
      decoding="async"
      className={`shrink-0 rounded-sm object-cover shadow-sm ring-1 ring-black/10 ${className}`}
    />
  );
}
