import { Metadata } from "next";
import TermsContent from "./TermsContent";
import { SEO_CONFIG } from "../config/seo";

export const metadata: Metadata = {
    title: `Terms of Service | ${SEO_CONFIG.siteName}`,
    description: `Terms of Service for ${SEO_CONFIG.siteName} - Understand your rights and responsibilities when using our AI fantasy image generation platform.`,
    alternates: {
        canonical: "/terms",
    },
};

export default function TermsPage() {
    return <TermsContent />;
}