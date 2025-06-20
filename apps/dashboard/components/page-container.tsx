export function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto max-w-4xl py-8 max-sm:px-4 max-sm:py-6">
      {children}
    </div>
  );
}
