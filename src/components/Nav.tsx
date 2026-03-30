import Link from "next/link";

export default function Nav() {
  return (
    <nav className="fixed top-0 w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur border-b border-zinc-100 dark:border-zinc-800 z-10">
      <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight hover:opacity-70 transition-opacity">
          Jan Cifra
        </Link>
        <div className="flex gap-6 text-sm text-zinc-500 dark:text-zinc-400">
          <a href="/#about" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">About</a>
          <a href="/#investments" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Investments</a>
          <a href="/#services" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Services</a>
          <Link href="/experience" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Experience</Link>
          <a href="/#contact" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Contact</a>
        </div>
      </div>
    </nav>
  );
}
