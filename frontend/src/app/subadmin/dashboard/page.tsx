import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subadmin Dashboard",
  robots: {
    index: false,
    follow: false
  }
};

export { default } from "../../admin/dashboard/page";
