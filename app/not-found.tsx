import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-tv10-cream dark:bg-tv10-dark px-4 text-center">
      <h1 className="text-6xl font-black text-tv10-red mb-4">404</h1>
      <h2 className="text-2xl font-bold text-tv10-metal dark:text-white mb-2">
        पेज नहीं मिला
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
        आप जो पेज ढूंढ रहे हैं वह मौजूद नहीं है या हटा दिया गया है।
      </p>
      <Link
        href="/"
        className="bg-tv10-red text-white font-bold px-6 py-3 rounded-full hover:bg-red-700 transition"
      >
        होम पेज पर जाएं
      </Link>
    </main>
  );
}
