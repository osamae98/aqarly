/* Icon set lifted verbatim from the Tenant Services Portal design file. Every
 * icon inherits `currentColor`, so colour comes from the surrounding token
 * class rather than from the icon itself. */

function Stroke({ size = 16, className = "", children }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

function Solid({ size = 16, className = "", viewBox = "0 0 24 24", children }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

export function Wrench(props) {
  return (
    <Solid {...props}>
      <path d="M8 2a6 6 0 0 1 5.743 7.743L20 16a2.828 2.828 0 0 1-3.785 4.194L16 20l-6.257-6.257a6 6 0 0 1-7.458-7.577L5.123 9l2.814-.937l.125-.126L9 5.127L6.158 2.288C6.738 2.101 7.358 2 8 2m4.586 9.57a.829.829 0 0 0-1.156 1.188l5.984 5.828a.829.829 0 0 0 1.172-1.172z" />
    </Solid>
  );
}

export function Broom(props) {
  return (
    <Solid {...props}>
      <path d="M9.866 8.116L10.98 6v-.77H9.596V4h4.846q.31 0 .54.23t.23.54v.692l-.885 1.769h-1.923V6.192l-1.846 1.924zM8.789 21v-5.812q0-.16.058-.366q.059-.207.126-.36L12.403 8h1.924q.215.216.339.486q.123.27.123.572V21zm1-1h4V9h-.781l-3.22 6.08zm0 0h4z" />
    </Solid>
  );
}

export function Bell(props) {
  return (
    <Stroke {...props}>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </Stroke>
  );
}

export function BellOff(props) {
  return (
    <Stroke {...props}>
      <path d="M8.7 3A6 6 0 0 1 18 8c0 3.3.7 5.3 1.3 6.5" />
      <path d="M4 8a6 6 0 0 0 .1 1.1c.2 2.3.2 5.5-1.1 6.9h14" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
      <path d="m2 2 20 20" />
    </Stroke>
  );
}

export function Home(props) {
  return (
    <Stroke {...props}>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M9 22V12h6v10" />
    </Stroke>
  );
}

export function History(props) {
  return (
    <Stroke {...props}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </Stroke>
  );
}

export function User(props) {
  return (
    <Stroke {...props}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </Stroke>
  );
}

export function UserCheck(props) {
  return (
    <Stroke {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="m16 11 2 2 4-4" />
    </Stroke>
  );
}

export function Send(props) {
  return (
    <Stroke {...props}>
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </Stroke>
  );
}

export function Clock(props) {
  return (
    <Stroke {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </Stroke>
  );
}

export function InProgress(props) {
  return (
    <Solid {...props} viewBox="0 0 16 16">
      <path d="M15 8c0 .454-.044.906-.13 1.345a.5.5 0 1 1-.981-.192a6.1 6.1 0 0 0 0-2.304a.499.499 0 1 1 .981-.192c.086.438.13.891.13 1.344zm-3.777-5.062a6.1 6.1 0 0 1 1.823 1.814a.5.5 0 1 0 .839-.542a7.1 7.1 0 0 0-2.126-2.115a.5.5 0 0 0-.537.842zM8 2c.469 0 .935.054 1.385.161a.5.5 0 0 0 .231-.974A7 7 0 0 0 8.001 1c-3.859 0-7 3.14-7 7s3.141 7 7 7c.546 0 1.089-.063 1.615-.187a.5.5 0 1 0-.231-.974A6.006 6.006 0 0 1 2 8c0-3.309 2.691-6 6-6m5.747 9.08a.5.5 0 0 0-.69.151a6.1 6.1 0 0 1-1.826 1.826a.499.499 0 1 0 .54.841a7.05 7.05 0 0 0 2.129-2.129a.5.5 0 0 0-.151-.69z" />
    </Solid>
  );
}

export function Check(props) {
  return (
    <Stroke {...props}>
      <path d="M20 6 9 17l-5-5" />
    </Stroke>
  );
}

export function CheckCircle(props) {
  return (
    <Stroke {...props}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="M22 4 12 14.01l-3-3" />
    </Stroke>
  );
}

export function ChevronLeft(props) {
  return (
    <Stroke {...props}>
      <path d="M15 18l-6-6 6-6" />
    </Stroke>
  );
}

export function ChevronRight(props) {
  return (
    <Stroke {...props}>
      <path d="M9 18l6-6-6-6" />
    </Stroke>
  );
}

export function ChevronDown(props) {
  return (
    <Stroke {...props}>
      <path d="M6 9l6 6 6-6" />
    </Stroke>
  );
}

export function Camera(props) {
  return (
    <Stroke {...props}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </Stroke>
  );
}

export function Mail(props) {
  return (
    <Stroke {...props}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 6L2 7" />
    </Stroke>
  );
}

export function Phone(props) {
  return (
    <Stroke {...props}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </Stroke>
  );
}

export function Grid(props) {
  return (
    <Stroke {...props}>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </Stroke>
  );
}

export function CreditCard(props) {
  return (
    <Stroke {...props}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 12h.01M18 12h.01" />
    </Stroke>
  );
}

export function FilePlus(props) {
  return (
    <Stroke {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M12 18v-6" />
      <path d="M9 15h6" />
    </Stroke>
  );
}

export function Search(props) {
  return (
    <Stroke {...props}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </Stroke>
  );
}

export function Plus(props) {
  return (
    <Stroke {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </Stroke>
  );
}
