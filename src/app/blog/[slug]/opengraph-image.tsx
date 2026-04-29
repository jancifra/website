import { ImageResponse } from "next/og";
import { getPost } from "@/lib/posts";

export const alt = "Jan Cifra";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: { slug: string } }) {
  const { meta } = getPost(params.slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "linear-gradient(135deg, #09090b 0%, #18181b 100%)",
          color: "#fafafa",
        }}
      >
        <div
          style={{
            fontSize: 28,
            color: "#71717a",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          Jan Cifra · Writing
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              fontSize: 88,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
            }}
          >
            {meta.title}
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#a1a1aa",
              marginTop: 32,
            }}
          >
            cifra.co/blog
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
