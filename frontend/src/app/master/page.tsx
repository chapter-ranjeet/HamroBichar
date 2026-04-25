import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Admin Login | एडमिन लगइन",
	description: "Secure admin login for HamroBichar newsroom | HamroBichar समाचार कक्षका लागि सुरक्षित एडमिन लगइन",
	robots: {
		index: false,
		follow: false
	}
};

export { default } from "../admin/login/page";
