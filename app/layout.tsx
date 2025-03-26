import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ConfigProvider, theme } from "antd";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "@/styles/globals.css";
import Navbar from "./navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "sopra-fs25-group-10",
  description: "sopra-fs25-template-client",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ConfigProvider
          theme={{
            algorithm: theme.defaultAlgorithm,
            token: {
              colorPrimary: "#22426b",
              borderRadius: 8,
              colorText: "#fff",
              fontSize: 16,
              colorBgContainer: "#16181D",
            },
            components: {
              Button: { colorPrimary: "#75bd9d", algorithm: true, controlHeight: 38 },
              Input: { colorBorder: "gray", colorTextPlaceholder: "#888888", algorithm: false },
              Form: { labelColor: "#fff", algorithm: theme.defaultAlgorithm },
            },
          }}
        >
          {/* ✅ Navbar is now imported here */}
          <Navbar />
          
          {/* Page Content */}
          <AntdRegistry>{children}</AntdRegistry>
        </ConfigProvider>
      </body>
    </html>
  );
}
