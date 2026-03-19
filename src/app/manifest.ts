import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ApplyTrack",
    short_name: "ApplyTrack",
    description: "Mobile-first jobbtracker med pipeline och pushpåminnelser.",
    start_url: "/",
    display: "standalone",
    background_color: "#f3f4f8",
    theme_color: "#6e33eb",
    lang: "sv-SE",
    icons: [
      {
        src: "/icons/Assets.xcassets/AppIcon.appiconset/180.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/icons/Assets.xcassets/AppIcon.appiconset/196.png",
        sizes: "196x196",
        type: "image/png",
      },
      {
        src: "/icons/Assets.xcassets/AppIcon.appiconset/512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}