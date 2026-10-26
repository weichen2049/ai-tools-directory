import { SEO_CONFIG } from "./config/seo";

export default function Head() {
  return (
    <>
      <meta name="description" lang="en" content={SEO_CONFIG.descriptionEn} />
      <meta name="keywords" content={SEO_CONFIG.keywords.join(", ")} />
    </>
  );
}