import { FlagIcon } from "./FlagIcon";

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
      className={`flex items-center gap-2 ${align === "right" ? "flex-row-reverse" : ""}`}
    >
      <FlagIcon
        team={team}
        size={24}
        className={
          highlight
            ? "ring-2 ring-dz-red ring-offset-1"
            : "ring-1 ring-fifa-blue/20"
        }
      />
      <span
        className={`truncate text-xs font-bold leading-tight sm:text-sm ${
          highlight ? "text-dz-green" : "text-ink"
        } ${align === "right" ? "text-right" : ""}`}
      >
        {team}
      </span>
    </div>
  );
}
