import ForgotPasswordClient from "./ForgotPasswordClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | BI Marketplace",
  description: "Reset your password instructions for BI Marketplace.",
  openGraph: {
    title: "Forgot Password - BI Marketplace",
    description: "Reset your password instructions for BI Marketplace.",
    url: "/auth/forgot-password",
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
    title: "Forgot Password - BI Marketplace",
    description: "Reset your password instructions for BI Marketplace.",
    images: ["/icon512_rounded.png"],
  },
};

export default function Page() {
  return <ForgotPasswordClient />;
}
