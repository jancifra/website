import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Media",
  description:
    "Interviews, podcasts, and press coverage featuring Jan Cifra — CEO of Dedoles, former CEO of WebSupport and Active24 — in Forbes, SME, Denník N, Startitup, and other Slovak media.",
  alternates: { canonical: "/media" },
};

type Mention = {
  /** ISO date, or "YYYY" / "YYYY-MM" when only the year or month is confirmed. */
  date: string;
  outlet: string;
  byline?: string;
  kind: "Interview" | "Article" | "Podcast" | "Announcement";
  title: string;
  url: string;
  /** Short excerpt. Slovak where it is a verbatim quote from the piece. */
  excerpt: string;
  /** English rendering, when the excerpt is in Slovak. */
  translation?: string;
  /** True when the excerpt is quoted verbatim from the source. */
  verbatim?: boolean;
};

const mentions: Mention[] = [
  {
    date: "2025-11-22",
    outlet: "Startitup · Let's Talk Business",
    kind: "Podcast",
    title: "Dedoles dvakrát v reštrukturalizácii: Aj najsilnejší marketing má svoje limity",
    url: "https://www.startitup.sk/videa/dedoles-dvakrat-v-restrukturalizacii-aj-najsilnejsi-marketing-ma-svoje-limity/",
    excerpt:
      "V tejto špeciálnej epizóde Let's Talk Business prinášajú lídri Dedolesu Ján Cifra a Jaroslav Chrapko otvorený pohľad na situáciu firmy, dôvody neúspešnej reštrukturalizácie a budúce plány.",
    translation:
      "A special episode in which the two Dedoles leaders give an open account of where the company stands, why the restructuring did not hold, and what comes next.",
    verbatim: true,
  },
  {
    date: "2025-09-17",
    outlet: "Startitup · Let's Talk Business",
    kind: "Podcast",
    title: "Cifra: Dedoles ponožky budeme predávať aj na Temu",
    url: "https://www.startitup.sk/videa/cifra-dedoles-ponozky-budeme-predavat-aj-na-temu/",
    excerpt:
      "On the company's position, why the original restructuring plan did not work out, and the decision to start selling Dedoles socks on Temu.",
  },
  {
    date: "2025",
    outlet: "Forbes Slovensko",
    kind: "Article",
    title: "Dedoles sa priblížil k záchrane. Veritelia odsúhlasili jeho oddlženie",
    url: "https://www.forbes.sk/dedoles-sa-priblizil-k-zachrane-veritelia-odsuhlasili-jeho-oddlzenie/",
    excerpt:
      "Creditors approve the debt write-down: secured creditors recover in full, unsecured creditors 55.5% — terms confirmed to Forbes by Cifra as CEO.",
  },
  {
    date: "2025",
    outlet: "Forbes Slovensko",
    kind: "Article",
    title: "Čínske e-shopy valcujú aj Dedoles. Firma opäť žiada veriteľov o odpustenie časti dlhu",
    url: "https://www.forbes.sk/cinske-e-shopy-valcuju-aj-dedoles-firma-opat-ziada-veritelov-o-odpustenie-casti-dlhu/",
    excerpt:
      "Chinese marketplaces, a sharp rise in online advertising costs, and changed buying behaviour push Dedoles into Slovakia's first public preventive restructuring.",
  },
  {
    date: "2025",
    outlet: "SME · Index",
    kind: "Article",
    title: "Dedoles čelí ďalším problémom. Dochádzajú mu peniaze, veriteľom chce vrátiť menej",
    url: "https://www.sme.sk/index/c/dedoles-problem-dlh-restrukturalizacia-veritelia-chrapko-cifra",
    excerpt:
      "Cifra explains why the original repayment schedule proved unrealistic — management concluded the 2026 and 2027 instalments could not be met.",
  },
  {
    date: "2024-08-09",
    outlet: "Denník E · Denník N",
    byline: "Ivan Haluza",
    kind: "Article",
    title: "Dedoles hneď prvý rok po páde do dlhov zarobil ako nikdy. Za vodou však nie je",
    url: "https://e.dennikn.sk/4138605/dedoles-hned-prvy-rok-po-pade-do-dlhov-zarobil-ako-nikdy-za-vodou-ale-nie-je/",
    excerpt: "Od jesene roku 2022 vedie Dedolesa Ján Cifra.",
    translation:
      "Ján Cifra has led Dedoles since autumn 2022 — brought in, the piece notes, for his broader experience rehabilitating distressed companies.",
    verbatim: true,
  },
  {
    date: "2024",
    outlet: "Forbes Slovensko",
    kind: "Interview",
    title: "Zľavy sú krátkozraké. Musíme zdvihnúť marže a ísť na Západ, hovorí krízový šéf Dedolesa",
    url: "https://www.forbes.sk/zlavy-su-kratkozrake-musime-zdvihnut-marze-a-ist-na-zapad-hovori-krizovy-sef-dedolesa/",
    excerpt:
      "A joint interview with founder Jaroslav Chrapko on reviving one of Slovakia's largest e-shops: fewer discount campaigns, disciplined pricing, higher margins, and a push into Western markets.",
  },
  {
    date: "2022-11-12",
    outlet: "Startitup",
    byline: "Jana Bačová",
    kind: "Interview",
    title: "Šialená jazda Dedolesu: Bankrot na stole nie je, potrebujeme rok, tvrdí nový CEO",
    url: "https://www.startitup.sk/sialena-jazda-dedolesu-bankrot-na-stole-nie-je-potrebujeme-rok-tvrdi-novy-ceo/",
    excerpt:
      "My máme víziu, myslíme si, že potrebujeme rok, aby sme tie fundamenty prestavali.",
    translation:
      "We have a vision — we think we need a year to rebuild the fundamentals.",
    verbatim: true,
  },
  {
    date: "2022-11-11",
    outlet: "Startitup · Let's Talk Business",
    kind: "Podcast",
    title: "Dedoles: Aj keď dlhujeme milióny eur, šanca na záchranu firmy je vysoká",
    url: "https://www.startitup.sk/videa/lets-talk-business-dedoles/",
    excerpt:
      "First long-form interview after taking over — on what caused the crisis and why the odds of saving the company are good.",
  },
  {
    date: "2022",
    outlet: "SME · Index",
    kind: "Interview",
    title: "Firma ako Dedoles dnes už nemôže vzniknúť. Zachrániť sa dá, tvrdí jej nový šéf",
    url: "https://index.sme.sk/c/23067186/dedoles-rozhovor-jan-cifra.html",
    excerpt:
      "On taking the job, what the e-commerce boom years hid, and why a company like Dedoles could not be built from scratch in today's market.",
  },
  {
    date: "2022",
    outlet: "Forbes Slovensko",
    kind: "Article",
    title: "Dedoles má nového šéfa. Jaroslav Chrapko sa rozhodol vo funkcii skončiť",
    url: "https://www.forbes.sk/dedoles-ma-noveho-sefa-jaroslav-chrapko-sa-rozhodol-vo-funkcii-skoncit/",
    excerpt:
      "Cifra takes over as CEO on 1 October 2022, succeeding founder Jaroslav Chrapko, arriving from WebSupport and Piano Media.",
  },
  {
    date: "2019-05-02",
    outlet: "Active24",
    kind: "Announcement",
    title:
      "ACTIVE 24 a WebSupport spájajú sily na ceste k hostingovému líderstvu v strednej Európe. Povedie ich Ján Cifra",
    url: "https://www.active24.sk/o-spolocnosti/media/active24-a-websupport-spajaju-sily",
    excerpt:
      "Spojením našich organizácií budeme môcť efektívnejšie zúročiť náš technologický aj marketingový talent, a to rovno pre dve skvelé značky.",
    translation:
      "By joining our organisations we can put our technology and marketing talent to work more effectively — across two great brands at once.",
    verbatim: true,
  },
  {
    date: "2015-10-08",
    outlet: "WebSupport",
    kind: "Announcement",
    title: "Nová posila do WS – CEO",
    url: "https://www.websupport.sk/blog/2015/10/predstavujeme-noveho-sefa-websupportu/",
    excerpt:
      "WebSupport introduces its new CEO, arriving from Piano Media with a stated priority of giving individual leaders more autonomy and responsibility.",
  },
];

const profiles = [
  {
    label: "SAPIE — board member profile",
    url: "https://sapie.sk/jan-cifra",
  },
  {
    label: "Lepšia konferencia — speaker profile",
    url: "https://www.lepsiakonferencia.sk/ludia/j%C3%A1n-cifra/",
  },
];

function formatDate(d: string) {
  const parts = d.split("-");
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) {
    return new Date(`${d}-01`).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  }
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function hostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function MediaPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans dark:bg-zinc-950 dark:text-zinc-100">
      <Nav />
      <main className="max-w-3xl mx-auto px-6 pt-32 pb-24">
        <div className="mb-12">
          <Link
            href="/"
            className="text-sm text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            ← Back
          </Link>
          <h1 className="text-3xl font-bold tracking-tight mt-6 mb-2">Media</h1>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-xl leading-relaxed">
            Interviews, podcasts, and press coverage — mostly Slovak media, mostly about Dedoles and
            the years before it. Excerpts are in the original language where they are direct quotes.
          </p>
        </div>

        <div className="space-y-10">
          {mentions.map((m) => (
            <article key={m.url} className="flex flex-col sm:flex-row gap-3 sm:gap-6">
              <div className="w-32 shrink-0 text-sm text-zinc-400 dark:text-zinc-500 pt-0.5">
                {formatDate(m.date)}
              </div>
              <div className="flex-1 min-w-0">
                <a
                  href={m.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium hover:underline underline-offset-4 break-words"
                >
                  {m.title}
                </a>
                <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                  {m.outlet}
                  {m.byline ? ` · ${m.byline}` : ""} · {m.kind} · {hostname(m.url)}
                </div>
                {m.verbatim ? (
                  <blockquote className="mt-2 border-l-2 border-zinc-200 dark:border-zinc-700 pl-4">
                    <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      &ldquo;{m.excerpt}&rdquo;
                    </p>
                    {m.translation && (
                      <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1.5 leading-relaxed">
                        {m.translation}
                      </p>
                    )}
                  </blockquote>
                ) : (
                  <p className="text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">{m.excerpt}</p>
                )}
              </div>
            </article>
          ))}
        </div>

        <section className="mt-20">
          <h2 className="text-xs font-semibold tracking-widest uppercase text-zinc-400 dark:text-zinc-500 mb-6">
            Profiles &amp; speaking
          </h2>
          <ul className="space-y-3">
            {profiles.map((p) => (
              <li key={p.url}>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:underline underline-offset-4 transition-colors"
                >
                  {p.label}
                </a>
                <span className="text-xs text-zinc-400 dark:text-zinc-500 ml-2">
                  {hostname(p.url)}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-16 text-sm text-zinc-400 dark:text-zinc-500 leading-relaxed">
          Writing about something I&apos;ve worked on and want a comment?{" "}
          <Link href="/contact" className="hover:text-zinc-900 dark:hover:text-zinc-100 underline underline-offset-4 transition-colors">
            Get in touch
          </Link>
          .
        </p>
      </main>
      <footer className="border-t border-zinc-100 dark:border-zinc-800">
        <div className="max-w-3xl mx-auto px-6 py-6 text-sm text-zinc-400 dark:text-zinc-600">
          © {new Date().getFullYear()} Jan Cifra
        </div>
      </footer>
    </div>
  );
}
