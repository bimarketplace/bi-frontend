import NotificationsClient from "./NotificationsClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications | BI Marketplace",
  description: "Stay up-to-date with your account activity, purchase inquiries, and marketplace updates on BI Marketplace.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <NotificationsClient />;
}
