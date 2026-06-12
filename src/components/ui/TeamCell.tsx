import { FlagIcon } from "./FlagIcon";

interface TeamCellProps {
  team: string;
  align?: "left" | "right";
  highlight?: boolean;
  size?: "sm" | "lg";
}

export function TeamCell({
  team,
  align = "left",
  highlight = false,
  size = "sm",
}: TeamCellProps) {
  const flagSize = size === "lg" ? 40 : 24;
  const textClass =
    size === "lg"
      ? "text-sm font-extrabold sm:text-base"
      : "text-xs font-bold sm:text-sm";

  return (
    <div
      className={`flex items-center gap-2 ${align === "right" ? "flex-row-reverse" : ""}`}
    >
      <FlagIcon
        team={team}
        size={flagSize}
        className={
          highlight
            ? "ring-2 ring-dz-red ring-offset-1"
            : "ring-1 ring-accent-emerald/25"
        }
      />
      <span
        className={`truncate leading-tight ${textClass} ${
          highlight ? "text-dz-green" : "text-ink"
        } ${align === "right" ? "text-right" : ""}`}
      >
        {team}
      </span>
    </div>
  );
}
