import { typeLabels } from "@aqarly/core/operations";
import { Broom, Wrench } from "./icons";

const types = {
  maintenance: {
    Icon: Wrench,
    className: "bg-category-maintenance-tint text-category-maintenance",
  },
  housekeeping: {
    Icon: Broom,
    className: "bg-category-housekeeping-tint text-category-housekeeping",
  },
};

export default function TypeTag({ type }) {
  const { Icon, className } = types[type] ?? types.maintenance;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-xs font-semibold ${className}`}
    >
      <Icon size={12} />
      {typeLabels[type] ?? type}
    </span>
  );
}
