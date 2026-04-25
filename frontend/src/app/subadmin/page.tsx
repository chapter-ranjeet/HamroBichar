import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subadmin Login | सबएडमिन लगइन",
  description: "Secure subadmin login for HamroBichar newsroom | HamroBichar समाचार कक्षका लागि सुरक्षित सबएडमिन लगइन",
  robots: {
    index: false,
    follow: false
  }
};

export { default } from "../admin/login/page";
