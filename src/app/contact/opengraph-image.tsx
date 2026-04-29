import { ImageResponse } from "next/og";

export const alt = "Get in touch · Jan Cifra";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
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
          Jan Cifra · cifra.co
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 120,
              fontWeight: 700,
              letterSpacing: "-0.04em",
              lineHeight: 1,
            }}
          >
            Get in touch
          </div>
          <div
            style={{
              fontSize: 36,
              color: "#a1a1aa",
              marginTop: 24,
              letterSpacing: "-0.01em",
              maxWidth: 1000,
            }}
          >
            Founders, boards, investors, and partners — drop me a few lines.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
