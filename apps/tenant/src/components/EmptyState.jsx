// What a screen shows when there's nothing to list, in the "ghost rows"
// style the user picked: a faint outline of what would be here (rows, cards,
// avatars, bars), with one small teal detail drawn over it. The ghosts fade
// up one after another and the teal strokes trace themselves in, once (see
// `.empty-art` in globals.css, which skips the motion for people who turn it
// off). Then a title and one line saying what will appear here. One ghost
// per kind of empty, so "nothing matches your search" never looks like
// "all done".
//
// No hooks, so it renders on the server like the pages that use it.
//
// Classes: `ghost` a faint filled shape, `slot` a dashed empty outline,
// `knock` a shape filled with the page color so it sits on top of the
// ghosts, `chip` a soft teal fill, `dot` a stronger teal fill for small marks, `draw` a teal stroke that traces in (it
// needs pathLength="1").

const rows = [10, 23, 36];

const arts = {
  // Search or filters that match nothing: rows, with a magnifier over them.
  search: (
    <>
      {rows.map((y) => (
        <rect key={y} className="pop ghost" x="6" y={y} width="44" height="9" rx="4" />
      ))}
      <circle className="pop knock" cx="39" cy="31" r="8" />
      <circle className="draw" pathLength="1" cx="39" cy="31" r="7" />
      <path className="draw" pathLength="1" d="M44 36 L49 41" strokeWidth="2.5" />
    </>
  ),
  // Nothing open: rows that are all ticked off.
  clear: (
    <>
      {rows.map((y) => (
        <rect key={y} className="pop ghost" x="6" y={y} width="44" height="9" rx="4" />
      ))}
      <path
        className="draw"
        pathLength="1"
        d="M11 14.5 L13 16.5 L16.5 12.5 M11 27.5 L13 29.5 L16.5 25.5 M11 40.5 L13 42.5 L16.5 38.5"
      />
    </>
  ),
  // Nobody waiting: empty slots, each with a dashed avatar.
  inbox: (
    <>
      {rows.map((y) => (
        <rect key={y} className="pop slot" x="6" y={y} width="44" height="9" rx="4" />
      ))}
      {rows.map((y) => (
        <circle key={`a${y}`} className="pop dot" cx="12" cy={y + 4.5} r="2.5" />
      ))}
    </>
  ),
  // A unit with nothing open: quiet rows, a small wrench badge.
  wrench: (
    <>
      {rows.map((y) => (
        <rect key={y} className="pop ghost" x="6" y={y} width="44" height="9" rx="4" />
      ))}
      <circle className="pop chip" cx="42" cy="40" r="9" />
      <path
        className="draw"
        pathLength="1"
        d="M45.5 35.5 a3.2 3.2 0 0 0 -4.3 4.3 L37 44 a1 1 0 0 0 1.4 1.4 L42.6 41.2 a3.2 3.2 0 0 0 4.3 -4.3 L45 38.8 L43.7 37.5 Z"
        strokeWidth="1.6"
      />
    </>
  ),
  // A building with no units: an empty grid of unit cards.
  building: (
    <>
      <rect className="pop slot" x="6" y="8" width="20" height="18" rx="4" />
      <rect className="pop slot" x="30" y="8" width="20" height="18" rx="4" />
      <rect className="pop slot" x="6" y="30" width="20" height="18" rx="4" />
      <rect className="pop slot" x="30" y="30" width="20" height="18" rx="4" />
      <path className="draw" pathLength="1" d="M16 13 V21 M12 17 H20" />
    </>
  ),
  // No history: table rows with a short date block and an empty line.
  history: (
    <>
      {rows.map((y) => (
        <g key={y}>
          <rect className="pop ghost" x="6" y={y} width="10" height="9" rx="3" />
          <rect className="pop ghost" x="19" y={y} width="31" height="9" rx="4" />
        </g>
      ))}
      <path className="draw" pathLength="1" d="M8.5 14.5 H13.5" />
    </>
  ),
  // Nothing charged: bars that never grew.
  receipt: (
    <>
      {rows.map((y) => (
        <g key={y}>
          <rect className="pop slot" x="6" y={y} width="44" height="9" rx="4" />
          <rect className="pop dot" x="6" y={y} width="4" height="9" rx="2" />
        </g>
      ))}
    </>
  ),
  // No requests yet: quiet rows, a teal "+" to start one.
  add: (
    <>
      {rows.map((y) => (
        <rect key={y} className="pop ghost" x="6" y={y} width="44" height="9" rx="4" />
      ))}
      <circle className="pop chip" cx="42" cy="40" r="9" />
      <path className="draw" pathLength="1" d="M42 36 V44 M38 40 H46" />
    </>
  ),
  // No notifications: empty rows, each with a small unread dot.
  bell: (
    <>
      {rows.map((y) => (
        <rect key={y} className="pop slot" x="6" y={y} width="44" height="9" rx="4" />
      ))}
      {rows.map((y) => (
        <circle key={`d${y}`} className="pop dot" cx="44" cy={y + 4.5} r="2" />
      ))}
    </>
  ),
  // No one on the team: dashed avatars around one to add.
  team: (
    <>
      <circle className="pop slot" cx="15" cy="28" r="8" />
      <circle className="pop slot" cx="41" cy="28" r="8" />
      <circle className="pop chip" cx="28" cy="28" r="9" />
      <path className="draw" pathLength="1" d="M28 24 V32 M24 28 H32" />
    </>
  ),
};

export default function EmptyState({ art, title, description, action, compact = false, className = "" }) {
  return (
    <div
      className={[
        "flex flex-col items-center text-center",
        compact ? "gap-1.5 py-6" : "gap-2 py-12",
        className,
      ].join(" ")}
    >
      <svg
        viewBox="0 0 56 56"
        aria-hidden
        className={`empty-art ${compact ? "size-16" : "size-22"}`}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      >
        {arts[art] ?? arts.clear}
      </svg>
      <h2 className={`${compact ? "text-[15px]" : "text-base"} mt-1 font-bold text-ink`}>{title}</h2>
      {description && <p className="max-w-sm text-sm text-ink-soft">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
