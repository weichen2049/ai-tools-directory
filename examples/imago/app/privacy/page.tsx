import { Metadata } from "next";
import PrivacyContent from "./PrivacyContent";
import { SEO_CONFIG } from "../config/seo";

export const metadata: Metadata = {
    title: `Privacy Policy | ${SEO_CONFIG.siteName}`,
    description: `Privacy Policy for ${SEO_CONFIG.siteName} - Learn how we collect, use, and protect your personal information.`,
    alternates: {
        canonical: "/privacy",
    },
};

export default function PrivacyPage() {
    return <PrivacyContent />;
}