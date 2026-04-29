import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";
import { Toaster } from "./components/ui/toaster";

const prompt = Prompt({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TitgameShop - เติมเกมออนไลน์ รวดเร็ว ปลอดภัย ราคาถูก | TitgameShop",
  description: "เติมเกมออนไลน์ เติมเงินเกมมือถือ เกมคอม ราคาถูก ปลอดภัย ได้รับยอดไว รองรับทุกเกมยอดนิยม เช่น ROV, Free Fire, PUBG, Genshin Impact และอีกมากมาย พร้อมบริการตลอด 24 ชั่วโมง.",
  keywords: [
    "เติมเกม", "เติมเงินเกม", "เติมเกมออนไลน์", "เติมเกมมือถือ", "เติมเกม ROV", "เติมเกม Free Fire", "เติมเกม PUBG", "เติมเกม Genshin", "ร้านเติมเกม", "TitgameShop", "ติ๊ดเกมช็อป"
  ],
  openGraph: {
    title: "ติ๊ดเกมช็อป - เติมเกมออนไลน์ รวดเร็ว ปลอดภัย ราคาถูก | TitgameShop",
    description: "เติมเกมออนไลน์ เติมเงินเกมมือถือ เกมคอม ราคาถูก ปลอดภัย ได้รับยอดไว รองรับทุกเกมยอดนิยม เช่น ROV, Free Fire, PUBG, Genshin Impact และอีกมากมาย พร้อมบริการตลอด 24 ชั่วโมง.",
    url: "https://imghost.titgame.shop/i/3f6fb01b-3e29-49f3-a1e7-af7ed2e689ff.png",
    siteName: "ติ๊ดเกมช็อป | TitgameShop",
    locale: "th_TH",
    type: "website",
    images: [
      {
        url: "https://imghost.titgame.shop/i/3f6fb01b-3e29-49f3-a1e7-af7ed2e689ff.png",
        width: 1200,
        height: 630,
        alt: "ติ๊ดเกมช็อป - เติมเกมออนไลน์ รวดเร็ว ปลอดภัย ราคาถูก"
      }
    ]
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
  },
  alternates: {
    canonical: "https://titgame.shop/"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${prompt.className} h-full antialiased`}>
      <head className="rounded-full">
        <link className="rounded-full" rel="icon" href="/logo.png" type="image/png" />
        {/* Facebook Meta Pixel Code */}
        <script dangerouslySetInnerHTML={{
          __html: `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1866483070705986');
fbq('track', 'PageView');` }} />
        <noscript>
          <img height="1" width="1" style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1866483070705986&ev=PageView&noscript=1"
            alt="fb pixel" />
        </noscript>
        {/* End Meta Pixel Code */}
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <div className={`${prompt.className} `}>
          <Toaster />
        </div>
      </body>
    </html>
  );
}
