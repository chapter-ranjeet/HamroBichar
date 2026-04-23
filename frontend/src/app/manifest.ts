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
        src: "/favicon-96x96.png",
        sizes: "96x96",
        type: "image/png"
      },
      {
        src: "/favicon-48x48.png",
        sizes: "48x48",
        type: "image/png"
      },
      {
        src: "/HBLogo2.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/HBLogo2.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      },
      {
        src: "/favicon.ico",
        sizes: "48x48",
        type: "image/x-icon"
      }
    ]
  };
}
