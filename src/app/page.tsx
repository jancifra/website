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
            <h1 className="text-5xl font-bold tracking-tight mb-1">Jan Cifra</h1>
            <p className="text-sm text-zinc-400 dark:text-zinc-500 mb-4">Principal, Cifra &amp; Co</p>
            <p className="text-xl text-zinc-500 dark:text-zinc-400 max-w-xl leading-relaxed">
              Operator, strategist, and investor. I work with founders and boards on the hard problems — strategy, leadership transitions, growth, and building things that last.
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
              I work with founders, boards, and investors who need senior operational and strategic experience — not just advice. Through Cifra &amp; Co, I take on executive roles, board seats, and advisory mandates across Central Europe, typically in technology and digital businesses at inflection points.
            </p>
            <p>
              Earlier I spent six years scaling a web hosting group from a single brand to a multi-country operation, before moving into e-commerce as CEO of Dedoles. I hold an MBA from Vlerick Business School and completed the Executive Program in Strategy and Organization at Stanford GSB. I&apos;m a board member of SAPIE, the Slovak alliance for innovation and the startup ecosystem.
            </p>
            <p>
              Based in Bratislava. I work in Slovak, English, German, and Czech.
            </p>
          </div>
        </section>

        {/* Investments */}
        <section id="investments">
          <h2 className="text-xs font-semibold tracking-widest uppercase text-zinc-400 dark:text-zinc-500 mb-6">Investments</h2>
          <div className="space-y-4 text-zinc-600 dark:text-zinc-400 leading-relaxed">
            <p>
              Alongside operational and strategic work, I invest in early-stage and growth-stage companies — primarily in technology, SaaS, and digital infrastructure. I look for founders who are building in sectors I know well and who want more than capital: a hands-on partner who has run a P&amp;L, shaped strategy, and sat on both sides of the table.
            </p>
          </div>
        </section>

        {/* Services */}
        <section id="services">
          <h2 className="text-xs font-semibold tracking-widest uppercase text-zinc-400 dark:text-zinc-500 mb-2">Services</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
            I work with founders, boards, and investors who need senior strategic and operational experience — not just advice.
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
                title: "Turnaround & Recovery",
                description: "Hands-on support when a business has lost its footing — financial distress, operational breakdown, or leadership gaps. Focused on stabilisation first, then getting back on track.",
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
            20 years across software, cloud services, e-commerce, and consulting — from service desk to CEO.
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
