import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900 px-6">
      <div className="text-center max-w-2xl">
        <p className="text-6xl font-bold text-slate-900 dark:text-white">
          404
        </p>

        <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
          Halaman tidak ditemukan
        </h1>

        <p className="mt-3 text-slate-600 dark:text-slate-300 max-w-md mx-auto">
          Halaman yang Anda cari tidak ada, sudah dipindahkan, atau dihapus.
        </p>

        <div className="mt-8">
          <Link
            href="/"
            className="px-6 py-3 rounded-full bg-sky-500 hover:bg-sky-600 text-white font-semibold shadow transition"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </main>
  );
}
