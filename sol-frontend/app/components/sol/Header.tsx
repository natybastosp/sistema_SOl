interface HeaderProps {
  pageTitle: string;
}

export default function Header({ pageTitle }: HeaderProps) {
  return (
    <div className="bg-white shadow-sm p-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">SOL</h1>
        <div className="text-sm text-gray-500">{pageTitle}</div>
      </div>
    </div>
  );
}
