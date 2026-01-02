"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    IndexLinkSchema,
    type IndexLinkInput,
    type CreateListingInput,
} from "@/lib/schemas/listing";
import {
    Search,
    TrendingUp,
    Users,
    CheckCircle,
    AlertCircle,
} from "lucide-react";

interface IndexLinkStepProps {
    defaultValues: Partial<CreateListingInput>;
    onSubmit: (data: IndexLinkInput) => void;
    onPrevious: () => void;
}

export function IndexLinkStep({
    defaultValues,
    onSubmit,
    onPrevious,
}: IndexLinkStepProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<any>(null);

    const {
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<IndexLinkInput>({
        resolver: zodResolver(IndexLinkSchema),
        defaultValues: {
            indexCompanyId: defaultValues.indexCompanyId,
            suiteDataSnapshot: defaultValues.suiteDataSnapshot,
        },
    });

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const response = await fetch(
                `/api/cindex/search?q=${encodeURIComponent(searchQuery)}`
            );
            if (response.ok) {
                const results = await response.json();
                setSearchResults(results);
            } else {
                setSearchResults([]);
            }
        } catch (error) {
            console.error("Search error:", error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectCompany = async (company: any) => {
        setSelectedCompany(company);
        setValue("indexCompanyId", company.id);

        // Fetch full company data with PULSE + TRACE
        try {
            const response = await fetch(`/api/cindex/${company.id}`);
            if (response.ok) {
                const data = await response.json();
                setValue("suiteDataSnapshot", {
                    pulse: data.pulse,
                    trace: data.trace,
                    revenue_verified: data.revenue_verified,
                    fabrknt_score: data.fabrknt_score,
                });
                setSelectedCompany({ ...company, ...data });
            }
        } catch (error) {
            console.error("Failed to fetch company data:", error);
        }
    };

    const handleSkip = () => {
        onSubmit({});
    };

    const onFormSubmit = (data: IndexLinkInput) => {
        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">
                    Link Index Data (Optional)
                </h2>
                <p className="text-muted-foreground">
                    Boost credibility by linking your listing to Fabrknt Index
                    data (PULSE + TRACE)
                </p>
            </div>

            {/* Benefits */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-3">
                    Why link Index data?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-purple-900">
                                Verified Metrics
                            </p>
                            <p className="text-xs text-purple-700">
                                On-chain verified data builds trust
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <TrendingUp className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-purple-900">
                                Growth Signals
                            </p>
                            <p className="text-xs text-purple-700">
                                TRACE shows verified ROI & growth
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <Users className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-purple-900">
                                Team Health
                            </p>
                            <p className="text-xs text-purple-700">
                                PULSE validates developer activity
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            {!selectedCompany && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Search for your company in Index
                        </label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    onKeyDown={(e) =>
                                        e.key === "Enter" &&
                                        (e.preventDefault(), handleSearch())
                                    }
                                    placeholder="Search by company name..."
                                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleSearch}
                                disabled={isSearching || !searchQuery.trim()}
                                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSearching ? "Searching..." : "Search"}
                            </button>
                        </div>
                    </div>

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                        <div className="border border-border rounded-lg divide-y divide-border max-h-96 overflow-y-auto">
                            {searchResults.map((result) => (
                                <button
                                    key={result.id}
                                    type="button"
                                    onClick={() => handleSelectCompany(result)}
                                    className="w-full p-4 text-left hover:bg-muted transition-colors flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="text-2xl">
                                            {result.logo || "🏢"}
                                        </div>
                                        <div>
                                            <p className="font-semibold">
                                                {result.name}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {result.category}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium">
                                            Score:{" "}
                                            {result.overallScore || "N/A"}/100
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {searchResults.length === 0 &&
                        searchQuery &&
                        !isSearching && (
                            <div className="border border-border rounded-lg p-6 text-center">
                                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                                <p className="text-muted-foreground">
                                    No companies found
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Try a different search term or skip this
                                    step
                                </p>
                            </div>
                        )}
                </div>
            )}

            {/* Selected Company Preview */}
            {selectedCompany && (
                <div className="border-2 border-purple-600 bg-purple-50 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="text-3xl">
                                {selectedCompany.logo || "🏢"}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">
                                    {selectedCompany.name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {selectedCompany.category}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedCompany(null);
                                setValue("indexCompanyId", undefined);
                                setValue("suiteDataSnapshot", undefined);
                            }}
                            className="text-sm text-purple-600 hover:underline"
                        >
                            Change
                        </button>
                    </div>

                    {selectedCompany.suiteDataSnapshot && (
                        <div className="grid grid-cols-3 gap-4 mt-4">
                            <div className="bg-white rounded-lg p-3 border border-purple-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <TrendingUp className="w-4 h-4 text-orange-600" />
                                    <span className="text-xs font-medium text-muted-foreground">
                                        TRACE
                                    </span>
                                </div>
                                <p className="text-2xl font-bold">
                                    {selectedCompany.suiteDataSnapshot.trace
                                        ?.growth_score || "N/A"}
                                    <span className="text-sm text-muted-foreground">
                                        /100
                                    </span>
                                </p>
                            </div>
                            <div className="bg-white rounded-lg p-3 border border-purple-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <Users className="w-4 h-4 text-blue-600" />
                                    <span className="text-xs font-medium text-muted-foreground">
                                        PULSE
                                    </span>
                                </div>
                                <p className="text-2xl font-bold">
                                    {selectedCompany.suiteDataSnapshot.pulse
                                        ?.vitality_score || "N/A"}
                                    <span className="text-sm text-muted-foreground">
                                        /100
                                    </span>
                                </p>
                            </div>
                            <div className="bg-white rounded-lg p-3 border border-purple-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <span className="text-xs font-medium text-muted-foreground">
                                        Fabrknt
                                    </span>
                                </div>
                                <p className="text-2xl font-bold">
                                    {selectedCompany.suiteDataSnapshot
                                        .fabrknt_score || "N/A"}
                                    <span className="text-sm text-muted-foreground">
                                        /100
                                    </span>
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {errors.indexCompanyId && (
                <p className="text-sm text-red-600">
                    {errors.indexCompanyId.message}
                </p>
            )}

            <div className="flex justify-between pt-4 border-t border-border">
                <button
                    type="button"
                    onClick={onPrevious}
                    className="px-6 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                    Previous
                </button>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={handleSkip}
                        className="px-6 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                    >
                        Skip
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        Create Listing
                    </button>
                </div>
            </div>
        </form>
    );
}
