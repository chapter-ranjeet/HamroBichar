import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Admin Dashboard | एडमिन ड्यासबोर्ड",
	robots: {
		index: false,
		follow: false
	}
};

export { default } from "../../admin/dashboard/page";
