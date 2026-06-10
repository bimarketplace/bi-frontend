import VerifyEmailClient from "./VerifyEmailClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Email | BI Marketplace",
  description: "Verify your email address for BI Marketplace.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <VerifyEmailClient />;
}
