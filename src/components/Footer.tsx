export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col items-center gap-2 text-center">
        <p className="text-sm font-medium text-white">
          VietBuy — Shopping made easy for visitors in Vietnam
        </p>
        <p className="text-xs text-gray-500">
          &copy; {year} VietBuy. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
