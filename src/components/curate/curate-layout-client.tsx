"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Network, Search, FolderTree, Globe } from "lucide-react";

interface CurateLayoutClientProps {
    children: React.ReactNode;
}

const NAV_ITEMS = [
    {
        href: "/curate",
        label: "Graph",
        icon: Network,
        exact: true,
    },
    {
        href: "/curate/explorer",
        label: "Explorer",
        icon: Search,
    },
    {
        href: "/curate/ecosystem/solana",
        label: "Ecosystems",
        icon: Globe,
    },
];

export function CurateLayoutClient({ children }: CurateLayoutClientProps) {
    const pathname = usePathname();

    const isActive = (href: string, exact?: boolean) => {
        if (exact) {
            return pathname === href;
        }
        return pathname.startsWith(href);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-card sticky top-0 z-50">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo / Title */}
                        <div className="flex items-center gap-3">
                            <Link href="/" className="flex items-center gap-2">
                                <span className="text-lg font-bold text-white">FABRKNT</span>
                            </Link>
                            <span className="text-slate-600">/</span>
                            <Link href="/curate" className="flex items-center gap-2">
                                <FolderTree className="h-5 w-5 text-cyan-400" />
                                <span className="text-lg font-semibold text-cyan-400">Curate</span>
                            </Link>
                        </div>

                        {/* Navigation Tabs */}
                        <nav className="flex items-center gap-1">
                            {NAV_ITEMS.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.href, item.exact);

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            active
                                                ? "bg-cyan-500/10 text-cyan-400"
                                                : "text-slate-400 hover:text-white hover:bg-slate-800"
                                        }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Right side - link to cindex */}
                        <div className="flex items-center gap-4">
                            <Link
                                href="/cindex"
                                className="text-sm text-slate-400 hover:text-white transition-colors"
                            >
                                Back to Index
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main>{children}</main>
        </div>
    );
}
