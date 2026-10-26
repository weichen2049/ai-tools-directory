import type { MetadataRoute } from "next";
import { PUBLIC_CONFIG } from "@lib/publicEnv";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: PUBLIC_CONFIG.appName,
    short_name: PUBLIC_CONFIG.appShortName,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml"
      }
    ]
  };
}