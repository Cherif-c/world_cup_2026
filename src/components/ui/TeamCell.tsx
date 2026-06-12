import Image from "next/image";
import { getFlagUrl } from "@/lib/teams";

interface TeamCellProps {
  team: string;
  align?: "left" | "right";
  highlight?: boolean;
}

export function TeamCell({
  team,
  align = "left",
  highlight = false,
}: TeamCellProps) {
  return (
    <div
      className={`flex items-center gap-2 ${align === "right" ? "flex-row-reverse text-right" : ""}`}
    >
      <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full ring-1 ring-line-soft">
        <Image
          src={getFlagUrl(team, 48)}
          alt={team}
          fill
          className="object-cover"
          sizes="24px"
        />
      </div>
      <span
        className={`truncate text-sm font-medium ${highlight ? "font-semibold text-dz-green" : "text-ink"}`}
      >
        {team}
      </span>
    </div>
  );
}
