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
        size={22}
        className="rounded-sm ring-1 ring-line-soft"
      />
      <span
        className={`truncate text-sm ${
          highlight ? "font-medium text-emerald-800" : "font-medium text-ink"
        } ${align === "right" ? "text-right" : ""}`}
      >
        {team}
      </span>
    </div>
  );
}
