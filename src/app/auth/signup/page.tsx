import SignupClient from "./SignupClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account | BI Marketplace",
  description: "Sign up for a BI Marketplace account to start buying and listing products.",
  openGraph: {
    title: "Create Account - BI Marketplace",
    description: "Join BI Marketplace today.",
    url: "/auth/signup",
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
    title: "Create Account - BI Marketplace",
    description: "Join BI Marketplace today.",
    images: ["/icon512_rounded.png"],
  },
};

export default function Page() {
  return <SignupClient />;
}
