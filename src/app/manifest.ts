import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Jobi.sh",
    short_name: "Jobi.sh",
    description: "Lite mindre jobbigt. Mer jobi.sh",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f5f7fb",
    theme_color: "#6e33eb",
    lang: "sv-SE",
    icons: [
      {
        src: "/icons/Assets.xcassets/AppIcon.appiconset/192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/Assets.xcassets/AppIcon.appiconset/512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/Assets.xcassets/AppIcon.appiconset/512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}