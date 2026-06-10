import LoginClient from "./LoginClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | BI Marketplace",
  description: "Log in to your BI Marketplace account to purchase items, message sellers, and manage your shop.",
  openGraph: {
    title: "Sign In - BI Marketplace",
    description: "Log in to your BI Marketplace account to purchase items, message sellers, and manage your shop.",
    url: "/auth/login",
    type: "website",
    images: [
      {
        url: "/icon512_rounded.png",
        width: 512,
        height: 512,
        alt: "BI Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Sign In - BI Marketplace",
    description: "Log in to your BI Marketplace account.",
    images: ["/icon512_rounded.png"],
  },
};

export default function Page() {
  return <LoginClient />;
}
