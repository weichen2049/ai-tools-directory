import { Metadata } from "next";
import ContactContent from "./ContactContent";
import { SEO_CONFIG } from "../config/seo";

export const metadata: Metadata = {
    title: `Contact Us | ${SEO_CONFIG.siteName}`,
    description: `Get in touch with ${SEO_CONFIG.siteName}. Send us your feedback, report bugs, or discuss collaborations.`,
    alternates: {
        canonical: "/contact",
    },
};

export default function ContactPage() {
    return <ContactContent />;
}