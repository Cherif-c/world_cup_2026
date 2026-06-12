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
      className={`flex items-center gap-2.5 ${align === "right" ? "flex-row-reverse text-right" : ""}`}
    >
      <FlagIcon
        team={team}
        size={26}
        className={
          highlight
            ? "ring-2 ring-dz-red ring-offset-1"
            : "ring-1 ring-fifa-blue/20"
        }
      />
      <span
        className={`truncate text-sm font-semibold ${
          highlight
            ? "font-bold text-dz-green"
            : "text-ink"
        }`}
      >
        {team}
      </span>
    </div>
  );
}
