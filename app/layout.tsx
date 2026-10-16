import React from "react";

export const metadata = {
  title: "Cloud Control Plane",
  description: "Dynamic Selector & Subagent Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ms">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
