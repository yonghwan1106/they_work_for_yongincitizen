import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const notoSansKr = Noto_Sans_KR({
  weight: ['400', '500', '700'],
  subsets: ["latin"],
  variable: "--font-noto-sans-kr",
});

export const metadata: Metadata = {
  title: "그들은 용인시민을 위해 일합니까? | 용인특례시의회 모니터링",
  description: "용인특례시의회 의원의 활동, 발언, 표결 기록을 투명하게 공개합니다. 시민의 알 권리 실현을 위한 플랫폼입니다.",
  keywords: "용인시의회, 용인시의원, 의정활동, 의회모니터링, 시민참여",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${notoSansKr.variable} antialiased font-sans`}>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
