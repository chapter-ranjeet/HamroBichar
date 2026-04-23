import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HamroBichar",
    short_name: "HamroBichar",
    description: "Latest Nepal news across politics, education, business, and technology.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#be123c",
    icons: [
      {
        src: "/HBlogo.png?v=2",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/HBlogo.png?v=2",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      },
      {
        src: "/HBlogo.ico?v=2",
        sizes: "48x48",
        type: "image/x-icon"
      }
    ]
  };
}
