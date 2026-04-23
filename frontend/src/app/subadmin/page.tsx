import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subadmin Login",
  description: "Secure subadmin login for HamroBichar newsroom.",
  robots: {
    index: false,
    follow: false
  }
};

export { default } from "../admin/login/page";
