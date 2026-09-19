import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 40,
          background: "#5e6ad2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="110" height="110" viewBox="0 0 32 32" fill="none">
          <path
            d="M22.4 8.3c-2-1.6-4.6-2.5-7.5-2.5C8 5.8 3 10.7 3 16.9c0 6.1 5 11 11.9 11 2.9 0 5.5-.9 7.5-2.5l-3.4-4.2c-1.1.9-2.6 1.4-4.1 1.4-3.7 0-6.5-2.7-6.5-6 0-3.4 2.8-6.1 6.5-6.1 1.5 0 3 .5 4.1 1.4l3.4-3.6Z"
            fill="white"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
