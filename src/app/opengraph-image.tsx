import { ImageResponse } from "next/og";

export const alt = "Jan Cifra · Operator · Strategist · Investor";
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
          justifyContent: "flex-end",
          alignItems: "flex-start",
          padding: "80px",
          background: "linear-gradient(135deg, #09090b 0%, #18181b 100%)",
          color: "#fafafa",
        }}
      >
        <div
          style={{
            fontSize: 32,
            color: "#71717a",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            marginBottom: 24,
          }}
        >
          cifra.co
        </div>
        <div
          style={{
            fontSize: 140,
            fontWeight: 700,
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          Jan Cifra
        </div>
        <div
          style={{
            fontSize: 44,
            color: "#a1a1aa",
            marginTop: 24,
            letterSpacing: "-0.01em",
          }}
        >
          Operator · Strategist · Investor
        </div>
      </div>
    ),
    { ...size },
  );
}
