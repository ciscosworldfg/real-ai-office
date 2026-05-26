import { Metadata } from "next";

export const metadata = {
  title: "Real Estate AI Office - Platinum Edition",
  description: "Complete AI-powered real estate automation suite with 9 workers and 60+ prompts",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: "system-ui, -apple-system, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
