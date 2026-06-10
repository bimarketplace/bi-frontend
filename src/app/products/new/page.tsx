import CreateProductClient from "./CreateProductClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "List New Product | BI Marketplace",
  description: "Create a new product listing on BI Marketplace.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <CreateProductClient />;
}
