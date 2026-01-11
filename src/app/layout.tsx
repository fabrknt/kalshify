import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] });

// Get the base URL for metadata
const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    "https://www.fabrknt.com";

export const metadata: Metadata = {
    title: {
        default: "Fabrknt - DeFi Intelligence Platform",
        template: "%s | Fabrknt",
    },
    description:
        "DeFi Intelligence Platform for curators and protocol teams. Risk scoring, APY stability analysis, liquidity risk assessment, and verified protocol data.",
    keywords: [
        "DeFi",
        "DeFi Intelligence",
        "Yield Curator",
        "Risk Scoring",
        "APY Stability",
        "Liquidity Risk",
        "Protocol Verification",
        "On-chain Data",
        "Solana",
        "Ethereum",
        "DeFi Analytics",
        "Yield Farming",
    ],
    authors: [{ name: "Fabrknt" }],
    creator: "Fabrknt",
    publisher: "Fabrknt",
    metadataBase: new URL(baseUrl),
    alternates: {
        canonical: "/",
    },
    openGraph: {
        type: "website",
        locale: "en_US",
        url: baseUrl,
        siteName: "Fabrknt",
        title: "Fabrknt - DeFi Intelligence Platform",
        description:
            "DeFi Intelligence Platform for curators and protocol teams. Risk scoring, APY stability analysis, liquidity risk assessment, and verified protocol data.",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Fabrknt - DeFi Intelligence Platform",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Fabrknt - DeFi Intelligence Platform",
        description:
            "DeFi Intelligence Platform for curators and protocol teams. Risk scoring, APY stability analysis, liquidity risk assessment, and verified protocol data.",
        creator: "@fabrknt",
        site: "@fabrknt",
        images: ["/og-image.png"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    icons: {
        icon: "/favicon.ico",
        apple: "/apple-touch-icon.png",
    },
    verification: {
        // Add when you have verification codes
        // google: "your-google-verification-code",
        // yandex: "your-yandex-verification-code",
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
};

// Structured data for SEO
const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Fabrknt",
    url: baseUrl,
    description:
        "DeFi Intelligence Platform for curators and protocol teams. Risk scoring, APY stability analysis, and verified protocol data.",
    potentialAction: {
        "@type": "SearchAction",
        target: {
            "@type": "EntryPoint",
            urlTemplate: `${baseUrl}/curate?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
    },
    publisher: {
        "@type": "Organization",
        name: "Fabrknt",
        url: baseUrl,
        logo: {
            "@type": "ImageObject",
            url: `${baseUrl}/logo.png`,
        },
        sameAs: ["https://twitter.com/fabrknt", "https://github.com/fabrknt"],
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(structuredData),
                    }}
                />
            </head>
            <body className={inter.className}>
                <Providers>{children}</Providers>
                <Toaster />
                <Analytics />
            </body>
        </html>
    );
}
