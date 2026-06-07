export default function StatementPrintLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <style>{`
        @media print {
          @page {
            margin: 1.5cm;
          }
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
      {children}
    </>
  )
}
