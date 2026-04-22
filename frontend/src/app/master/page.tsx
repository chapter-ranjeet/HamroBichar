import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Admin Login",
	description: "Secure admin login for HamroBichar newsroom.",
	robots: {
		index: false,
		follow: false
	}
};

export { default } from "../admin/login/page";
