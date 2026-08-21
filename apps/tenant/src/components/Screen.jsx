import ScreenHeader from "./ScreenHeader";

// One screen of the portal: the shared header bar plus the scrolling body the
// design calls `.content`.
export default function Screen({
  title,
  backHref,
  action,
  className = "",
  children,
}) {
  return (
    <>
      <ScreenHeader title={title} backHref={backHref} action={action} />
      <main className={`flex flex-1 flex-col p-6 ${className}`}>{children}</main>
    </>
  );
}
