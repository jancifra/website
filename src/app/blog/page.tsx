import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Writing · Jan Cifra",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans dark:bg-zinc-950 dark:text-zinc-100">
      <Nav />
      <main className="max-w-3xl mx-auto px-6 pt-32 pb-24">
        <div className="mb-12">
          <Link href="/" className="text-sm text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            ← Back
          </Link>
          <h1 className="text-3xl font-bold tracking-tight mt-6 mb-2">Writing</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Thoughts on strategy, leadership, and building organisations.</p>
        </div>
        <div className="space-y-10">
          {posts.map((post) => (
            <div key={post.slug}>
              <p className="text-sm text-zinc-400 dark:text-zinc-500 mb-1">
                {new Date(post.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </p>
              <Link href={`/blog/${post.slug}`} className="group">
                <h2 className="text-xl font-semibold group-hover:underline underline-offset-4">{post.title}</h2>
              </Link>
              <p className="text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">{post.excerpt}</p>
            </div>
          ))}
        </div>
      </main>
      <footer className="border-t border-zinc-100 dark:border-zinc-800">
        <div className="max-w-3xl mx-auto px-6 py-6 text-sm text-zinc-400 dark:text-zinc-600">
          © {new Date().getFullYear()} Jan Cifra
        </div>
      </footer>
    </div>
  );
}
