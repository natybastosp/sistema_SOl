interface HeaderProps {
  pageTitle: string;
}

export default function Header({ pageTitle }: HeaderProps) {
  return (
    <div className="bg-gradient-to-r from-sol-primary to-sol-dark shadow-md p-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">☀️ SOL</h1>
        <div className="text-sm text-sol-light font-medium">{pageTitle}</div>
      </div>
    </div>
  );
}
