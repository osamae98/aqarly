import { BottomNav } from "@/components/NavLinks";

// The three tab screens sit above a fixed bottom bar on phones; on wider
// screens the same destinations move into the header, so the padding goes.
export default function TabsLayout({ children }) {
  return (
    <>
      <div className="flex flex-1 flex-col pb-14 md:pb-0">{children}</div>
      <BottomNav />
    </>
  );
}
