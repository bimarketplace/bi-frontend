import ProfileClient from "./ProfileClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Profile | BI Marketplace",
  description: "Manage your store listings, edit your profile details, bio, and vendor settings on BI Marketplace.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <ProfileClient />;
}
