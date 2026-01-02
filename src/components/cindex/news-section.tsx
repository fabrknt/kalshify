import { ExternalLink, Newspaper, Calendar, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface NewsItem {
    title: string;
    url: string;
    date: string;
    summary?: string;
    source: string;
}

interface NewsSectionProps {
    news?: NewsItem[];
}

export function NewsSection({ news }: NewsSectionProps) {
    if (!news || news.length === 0) {
        return null;
    }

    // Separate potential partnerships (items with summaries that aren't "Not a partnership")
    // For now, if summary exists and is long enough, we treat it as interesting
    const partnerships = news.filter(
        (item) =>
            item.summary &&
            item.summary.length > 20 &&
            !item.summary.includes("Not a partnership")
    );
    const generalNews = news.filter((item) => !partnerships.includes(item));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Latest Updates */}
            <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center gap-2">
                    <Newspaper className="h-5 w-5 text-purple-600" />
                    <h2 className="text-xl font-semibold text-foreground">
                        Latest Updates
                    </h2>
                </div>

                <div className="grid gap-4">
                    {generalNews.slice(0, 5).map((item, idx) => (
                        <Link
                            key={idx}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block bg-card border border-border rounded-lg p-4 hover:border-purple-200 transition-all hover:shadow-sm"
                        >
                            <div className="flex justify-between items-start gap-4">
                                <div className="space-y-1">
                                    <h3 className="font-medium text-foreground group-hover:text-purple-700 transition-colors line-clamp-2">
                                        {item.title}
                                    </h3>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {formatDistanceToNow(
                                                new Date(item.date),
                                                { addSuffix: true }
                                            )}
                                        </span>
                                        <span className="px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                                            {item.source}
                                        </span>
                                    </div>
                                </div>
                                <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* AI Partnership Analysis */}
            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    <h2 className="text-xl font-semibold text-foreground">
                        Partnership Intel
                    </h2>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-lg p-6 space-y-6 max-h-[600px] overflow-y-auto">
                    {partnerships.length > 0 ? (
                        partnerships.map((item, idx) => (
                            <div
                                key={idx}
                                className="relative pl-6 pb-6 last:pb-0 border-l border-purple-200"
                            >
                                <div className="absolute left-[-5px] top-0 h-2.5 w-2.5 rounded-full bg-purple-600 ring-4 ring-purple-100" />
                                <h4 className="text-sm font-semibold text-foreground mb-1">
                                    {item.title}
                                </h4>
                                <p className="text-xs text-muted-foreground mb-2">
                                    {item.summary}
                                </p>
                                <Link
                                    href={item.url}
                                    target="_blank"
                                    className="text-xs text-purple-600 hover:text-purple-700 font-medium inline-flex items-center gap-1"
                                >
                                    View Source{" "}
                                    <ExternalLink className="h-3 w-3" />
                                </Link>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            <p>
                                No major partnership announcements detected
                                recently.
                            </p>
                        </div>
                    )}

                    <div className="pt-4 border-t border-purple-100">
                        <p className="text-xs text-muted-foreground italic">
                            Powered by Gemini AI analysis of official blogs and
                            announcements.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
