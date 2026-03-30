import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Experience · Jan Cifra",
};

const jobs = [
  {
    role: "Chief Executive Officer",
    company: "Dedoles",
    period: "Oct 2022 – Present",
    description: "Leading one of Central Europe's fastest-growing e-commerce brands, known for its original and colourful socks and accessories.",
  },
  {
    role: "Independent Board Member",
    company: "Vacuumlabs",
    period: "Mar 2023 – Present",
    description: "Board member at a global software and fintech company headquartered in Bratislava.",
  },
  {
    role: "Board Member",
    company: "Slovak Alliance for Innovation Economy (SAPIE)",
    period: "Jun 2020 – Present",
    description: "Contributing to the Slovak innovation and startup ecosystem.",
  },
  {
    role: "CEO / Managing Director CEE",
    company: "WebSupport · Active24 · Loopia Group",
    period: "Aug 2015 – Feb 2022",
    description: "Six-year tenure scaling the CEE web hosting business. As Managing Director CEE at Loopia Group, responsible for WebSupport.sk, Active24.cz, and Webonic.hu. Simultaneously served as CEO of WebSupport (2015–2022) and CEO of Active24 (2019–2022).",
  },
  {
    role: "Board Member",
    company: "Slovenská debatná asociácia",
    period: "Dec 2018 – Sep 2022",
    description: "Supporting debate education and critical thinking among Slovak youth.",
  },
  {
    role: "Head of Business Development",
    company: "Piano Media",
    period: "Sep 2011 – Dec 2014",
    description: "Business analysis, fundraising, setting up international sales, and launching international clients. Also responsible for the marketing and analytics team.",
  },
  {
    role: "Director, Banking Software & Services",
    company: "AXASOFT",
    period: "May 2009 – Aug 2010",
    description: "Business unit manager with 25 direct reports (developers, testers, PMs, account managers). Customers included banks and insurance companies across Slovakia.",
  },
  {
    role: "Team Lead Application Development → System Engineer SAP Netweaver",
    company: "Qimonda",
    period: "Nov 2006 – May 2009",
    description: "Managed global software development across SAP Netweaver, Lotus Notes, and Master Data. Led key projects including platform migrations and the Qimonda carve-out from Infineon.",
  },
  {
    role: "Expert Support Center Specialist",
    company: "Infineon Technologies",
    period: "Nov 2005 – Nov 2006",
    description: "Part-time service desk agent.",
  },
];

export default function ExperiencePage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans dark:bg-zinc-950 dark:text-zinc-100">
      <Nav />
      <main className="max-w-3xl mx-auto px-6 pt-32 pb-24">
        <div className="mb-12">
          <Link href="/" className="text-sm text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            ← Back
          </Link>
          <h1 className="text-3xl font-bold tracking-tight mt-6 mb-2">Experience</h1>
          <p className="text-zinc-500 dark:text-zinc-400">20 years across software, hosting, e-commerce, and consulting.</p>
        </div>
        <div className="space-y-10">
          {jobs.map((job) => (
            <div key={`${job.role}-${job.company}`} className="flex gap-6">
              <div className="w-36 shrink-0 text-sm text-zinc-400 dark:text-zinc-500 pt-0.5">{job.period}</div>
              <div>
                <div className="font-medium">{job.role}</div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">{job.company}</div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{job.description}</div>
              </div>
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
