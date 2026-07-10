import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 p-6 text-center">
      <h1 className="text-4xl font-bold text-zinc-900 mb-2">404 - Not Found</h1>
      <p className="text-zinc-600 mb-6">The page you are looking for does not exist.</p>
      <Link href="/" className="px-6 py-2 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 transition-colors">
        Return Home
      </Link>
    </div>
  );
}
