export function PrintHeader() {
  return (
    <div className="hidden items-center gap-2 pb-4 print:flex">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.jpeg" alt="SOWwork" className="h-8 w-auto" />
    </div>
  );
}
