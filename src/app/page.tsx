import Link from "next/link";
import Image from "next/image";
import Nav from "@/components/Nav";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans dark:bg-zinc-950 dark:text-zinc-100">
      <Nav />

      <main className="max-w-3xl mx-auto px-6 pt-32 pb-24 space-y-24">
        {/* Hero */}
        <section className="flex flex-col sm:flex-row sm:items-center gap-10">
          <Image
            src="/jan-cifra.jpg"
            alt="Jan Cifra"
            width={160}
            height={160}
            className="rounded-2xl object-cover w-36 h-36 sm:w-40 sm:h-40 shrink-0"
            priority
          />
          <div>
            <p className="text-sm font-medium text-zinc-400 dark:text-zinc-500 mb-3 tracking-wide uppercase">Hello, I&apos;m</p>
            <h1 className="text-5xl font-bold tracking-tight mb-4">Jan Cifra</h1>
            <p className="text-xl text-zinc-500 dark:text-zinc-400 max-w-xl leading-relaxed">
              People &amp; Technology. Entrepreneur and executive building companies at the intersection of e-commerce, hosting, and digital innovation in Central Europe.
            </p>
          <div className="mt-8 flex gap-3">
            <a
              href="#contact"
              className="px-5 py-2.5 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
            >
              Get in touch
            </a>
            <a
              href="https://www.linkedin.com/in/jancifra"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-full border border-zinc-200 dark:border-zinc-700 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              LinkedIn
            </a>
          </div>
          </div>
        </section>

        {/* About */}
        <section id="about">
          <h2 className="text-xs font-semibold tracking-widest uppercase text-zinc-400 dark:text-zinc-500 mb-6">About</h2>
          <div className="space-y-4 text-zinc-600 dark:text-zinc-400 leading-relaxed">
            <p>
              I&apos;m an entrepreneur and tech executive based in Bratislava, Slovakia, with a passion for people and technology. I focus on building and scaling businesses in e-commerce, web hosting, and digital services across Central Europe.
            </p>
            <p>
              I hold an MBA from Vlerick Business School (graduated with Great Distinction) and completed the Executive Program in Strategy and Organization at Stanford GSB. I&apos;m actively involved in the Slovak startup and innovation ecosystem as a board member of SAPIE.
            </p>
            <p>
              I speak Slovak, English, German, and Czech.
            </p>
          </div>
        </section>

        {/* Services */}
        <section id="services">
          <h2 className="text-xs font-semibold tracking-widest uppercase text-zinc-400 dark:text-zinc-500 mb-2">Services</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
            I work with founders, boards, and investors who need senior operational experience — not just advice.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                title: "Board Member",
                description: "Independent board representation for tech and digital companies. I bring operational depth, a founder's perspective, and a direct challenge to strategic assumptions.",
              },
              {
                title: "Interim Management",
                description: "Stepping in as interim CEO or senior executive when organisations need proven leadership during transitions, restructuring, or rapid scaling.",
              },
              {
                title: "Crisis Management",
                description: "Hands-on support when things go wrong — financial distress, operational breakdown, or leadership gaps. Focused on stabilisation first, recovery second.",
              },
              {
                title: "Executive Coaching",
                description: "One-on-one coaching for founders and senior leaders navigating growth, organisational complexity, or personal inflection points in their careers.",
              },
              {
                title: "M&A Advisory",
                description: "Operational and strategic support through acquisitions, mergers, and exits — from due diligence and integration planning to post-deal execution.",
              },
              {
                title: "Business Consulting",
                description: "Strategic and commercial consulting for digital businesses. From market entry and growth strategy to organisational design and performance improvement.",
              },
            ].map((service) => (
              <div
                key={service.title}
                className="p-5 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors"
              >
                <div className="font-semibold mb-2">{service.title}</div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{service.description}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Experience teaser */}
        <section>
          <h2 className="text-xs font-semibold tracking-widest uppercase text-zinc-400 dark:text-zinc-500 mb-6">Experience</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            20 years across software, web hosting, e-commerce, and consulting — from service desk to CEO.
            Currently leading Dedoles and serving on the boards of Vacuumlabs and SAPIE.
          </p>
          <Link
            href="/experience"
            className="text-zinc-900 dark:text-zinc-100 font-medium hover:underline underline-offset-4"
          >
            View full experience →
          </Link>
        </section>

        {/* Contact */}
        <section id="contact">
          <h2 className="text-xs font-semibold tracking-widest uppercase text-zinc-400 dark:text-zinc-500 mb-6">Contact</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            Feel free to reach out for collaborations, opportunities, or just to say hello.
          </p>
          <a
            href="https://www.linkedin.com/in/jancifra"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-900 dark:text-zinc-100 font-medium hover:underline underline-offset-4"
          >
            Connect on LinkedIn →
          </a>
        </section>
      </main>

      <footer className="border-t border-zinc-100 dark:border-zinc-800">
        <div className="max-w-3xl mx-auto px-6 py-6 text-sm text-zinc-400 dark:text-zinc-600">
          © {new Date().getFullYear()} Jan Cifra
        </div>
      </footer>
    </div>
  );
}
