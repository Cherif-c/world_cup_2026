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
      className={`flex items-center gap-2 ${align === "right" ? "flex-row-reverse text-right" : ""}`}
    >
      <FlagIcon team={team} size={24} />
      <span
        className={`truncate text-sm font-medium ${highlight ? "font-semibold text-dz-green" : "text-ink"}`}
      >
        {team}
      </span>
    </div>
  );
}
