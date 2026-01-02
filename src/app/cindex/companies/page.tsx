import { Search } from "lucide-react";
import { CompanyCard } from "@/components/cindex/company-card";
import { getCompanies, type Company } from "@/lib/cindex/companies";

// Mark page as dynamic since it uses database
export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
    const companiesList = await getCompanies();

    // Handle empty state
    if (companiesList.length === 0) {
        return (
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        Company Directory
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        No companies found. Please check your database
                        connection.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground">
                    Company Directory
                </h1>
                <p className="text-muted-foreground mt-2">
                    Browse all {companiesList.length} verified web3 companies
                    with on-chain and off-chain index
                </p>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-4">
                <div className="flex-1 max-w-md">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search companies..."
                            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-card rounded-lg border border-border p-6">
                    <p className="text-sm text-muted-foreground mb-1">
                        Total Companies
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                        {companiesList.length}
                    </p>
                    <p className="text-sm text-muted-foreground/75 mt-1">
                        verified
                    </p>
                </div>
                <div className="bg-card rounded-lg border border-border p-6">
                    <p className="text-sm text-muted-foreground mb-1">
                        Avg Index Score
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                        {companiesList.length > 0
                            ? Math.round(
                                  companiesList.reduce(
                                      (sum: number, c: Company) =>
                                          sum + c.overallScore,
                                      0
                                  ) / companiesList.length
                              )
                            : 0}
                    </p>
                    <p className="text-sm text-muted-foreground/75 mt-1">
                        out of 100
                    </p>
                </div>
                <div className="bg-card rounded-lg border border-border p-6">
                    <p className="text-sm text-muted-foreground mb-1">
                        Listed in Marketplace
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                        {
                            companiesList.filter((c: Company) => c.isListed)
                                .length
                        }
                    </p>
                    <p className="text-sm text-muted-foreground/75 mt-1">
                        available for acquisition
                    </p>
                </div>
                <div className="bg-card rounded-lg border border-border p-6">
                    <p className="text-sm text-muted-foreground mb-1">
                        Growing Fast
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                        {
                            companiesList.filter(
                                (c: Company) => c.trend === "up"
                            ).length
                        }
                    </p>
                    <p className="text-sm text-muted-foreground/75 mt-1">
                        upward trend
                    </p>
                </div>
            </div>

            {/* Company Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companiesList.map((company: Company) => (
                    <CompanyCard key={company.slug} company={company} />
                ))}
            </div>
        </div>
    );
}
