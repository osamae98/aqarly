import { stageLabels } from "@aqarly/core/operations";
import { Check, InProgress, Send, UserCheck } from "./icons";

const stageStyles = {
  submitted: {
    Icon: Send,
    className: "bg-stage-submitted-tint text-stage-submitted",
  },
  assigned: {
    Icon: UserCheck,
    className: "bg-stage-assigned-tint text-stage-assigned",
  },
  "in-progress": {
    Icon: InProgress,
    className: "bg-stage-in-progress-tint text-stage-in-progress",
  },
  done: { Icon: Check, className: "bg-stage-done-tint text-stage-done" },
};

export default function StageTag({ stage }) {
  const { Icon, className } = stageStyles[stage] ?? stageStyles.submitted;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-semibold ${className}`}
    >
      <Icon size={12} />
      {stageLabels[stage] ?? stage}
    </span>
  );
}
