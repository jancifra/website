import { getAllNotes } from "@/lib/notes";

const SITE_URL = "https://cifra.co";
const FEED_URL = `${SITE_URL}/notes/rss.xml`;
const NOTES_URL = `${SITE_URL}/notes`;
const FEED_TITLE = "Jan Cifra · Notes";
const FEED_DESCRIPTION =
  "One link a day. Tech, AI, regulation, VC, and the moves of the companies that matter — with short commentary from Jan Cifra.";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function escapeCdata(s: string): string {
  return s.replace(/]]>/g, "]]]]><![CDATA[>");
}

function escapeHtmlAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function escapeHtmlText(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function rfc822(date: string): string {
  // Anchor each note at noon UTC on its date so the timestamp is deterministic
  // and stable regardless of when the build runs.
  return new Date(`${date}T12:00:00Z`).toUTCString();
}

export const dynamic = "force-static";

export function GET() {
  const notes = getAllNotes();
  const lastBuild = notes.length > 0 ? rfc822(notes[0].date) : new Date().toUTCString();

  const items = notes
    .map((n) => {
      const html =
        `<p>${escapeHtmlText(n.commentary)}</p>` +
        `<p><a href="${escapeHtmlAttr(n.url)}">${escapeHtmlText(n.source)} →</a></p>`;
      return `    <item>
      <title>${escapeXml(n.title)}</title>
      <link>${escapeXml(n.url)}</link>
      <guid isPermaLink="false">cifra.co/notes/${n.date}</guid>
      <pubDate>${rfc822(n.date)}</pubDate>
      <source url="${escapeXml(n.url)}">${escapeXml(n.source)}</source>
      <description><![CDATA[${escapeCdata(n.commentary)}]]></description>
      <content:encoded><![CDATA[${escapeCdata(html)}]]></content:encoded>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(FEED_TITLE)}</title>
    <link>${NOTES_URL}</link>
    <atom:link href="${FEED_URL}" rel="self" type="application/rss+xml" />
    <description>${escapeXml(FEED_DESCRIPTION)}</description>
    <language>en</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
