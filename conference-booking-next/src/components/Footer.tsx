export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-6">
      <div className="px-6 flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-gray-500">
        <p>© {new Date().getFullYear()} Conference Booking System</p>
        <p>Developed by <span className="text-gray-700 font-medium">Moeketsi Junior Sillo</span></p>
      </div>
    </footer>
  );
}