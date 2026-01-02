"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    MAAcquisitionMetricsSchema,
    PartnershipMetricsSchema,
    type MetricsInput,
    type CreateListingInput,
    ListingTypeEnum,
    isMAType,
} from "@/lib/schemas/listing";
import { z } from "zod";
import { useState } from "react";

interface MetricsStepProps {
    listingType: z.infer<typeof ListingTypeEnum>;
    defaultValues: Partial<CreateListingInput>;
    onNext: (data: Partial<MetricsInput>) => void;
    onPrevious: () => void;
}

const partnerTypeOptions = [
    "Developers",
    "Investors",
    "Marketing agencies",
    "DeFi protocols",
    "NFT projects",
    "Gaming platforms",
    "Infrastructure providers",
    "Payment processors",
    "KOLs & Influencers",
    "Media & Press",
];

const capabilityOptions = [
    "Smart contract development",
    "Frontend development",
    "Marketing & PR",
    "Community management",
    "Liquidity provision",
    "Node infrastructure",
    "Security auditing",
    "Business development",
    "Token economics",
    "Legal & Compliance",
];

export function MetricsStep({
    listingType,
    defaultValues,
    onNext,
    onPrevious,
}: MetricsStepProps) {
    const isMA = isMAType(listingType);

    // Type-safe access to discriminated union properties
    const defaultValuesTyped = defaultValues as any;

    const [seekingPartners, setSeekingPartners] = useState<string[]>(
        (defaultValuesTyped.seekingPartners as string[]) || []
    );
    const [offeringCapabilities, setOfferingCapabilities] = useState<string[]>(
        (defaultValuesTyped.offeringCapabilities as string[]) || []
    );

    const schema = isMA ? MAAcquisitionMetricsSchema : PartnershipMetricsSchema;

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            revenue: defaultValues.revenue || 0,
            mau: defaultValues.mau || 0,
            askingPrice: defaultValuesTyped.askingPrice,
            partnershipType: defaultValuesTyped.partnershipType,
        },
    });

    const toggleArrayItem = (
        array: string[],
        item: string,
        setter: (arr: string[]) => void,
        fieldName: "seekingPartners" | "offeringCapabilities"
    ) => {
        const newArray = array.includes(item)
            ? array.filter((i) => i !== item)
            : [...array, item];
        setter(newArray);
        setValue(fieldName as any, newArray);
    };

    const onSubmit = (data: any) => {
        if (!isMA) {
            data.seekingPartners = seekingPartners;
            data.offeringCapabilities = offeringCapabilities;
        }
        onNext({ ...data, type: listingType });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">
                    Metrics & Performance
                </h2>
                <p className="text-muted-foreground">
                    {isMA
                        ? "Provide key metrics for acquisition valuation"
                        : "Share your metrics and partnership needs"}
                </p>
            </div>

            <div className="space-y-4">
                {/* Revenue */}
                <div>
                    <label
                        htmlFor="revenue"
                        className="block text-sm font-medium mb-2"
                    >
                        Annual Revenue (USD) *
                    </label>
                    <input
                        {...register("revenue", { valueAsNumber: true })}
                        id="revenue"
                        type="number"
                        min="0"
                        step="1000"
                        placeholder="2500000"
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                        Annual recurring revenue (ARR) or trailing 12 months
                        revenue
                    </p>
                    {errors.revenue && (
                        <p className="text-sm text-red-600 mt-1">
                            {errors.revenue.message}
                        </p>
                    )}
                </div>

                {/* MAU */}
                <div>
                    <label
                        htmlFor="mau"
                        className="block text-sm font-medium mb-2"
                    >
                        Monthly Active Users (MAU) *
                    </label>
                    <input
                        {...register("mau", { valueAsNumber: true })}
                        id="mau"
                        type="number"
                        min="0"
                        step="100"
                        placeholder="15000"
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                        Unique active users in the last 30 days
                    </p>
                    {errors.mau && (
                        <p className="text-sm text-red-600 mt-1">
                            {errors.mau.message}
                        </p>
                    )}
                </div>

                {/* M&A Specific Fields */}
                {isMA && (
                    <div>
                        <label
                            htmlFor="askingPrice"
                            className="block text-sm font-medium mb-2"
                        >
                            Asking Price (USD){" "}
                            {listingType === "investment" ? "(Optional)" : "*"}
                        </label>
                        <input
                            {...register("askingPrice", {
                                valueAsNumber: true,
                            })}
                            id="askingPrice"
                            type="number"
                            min="0"
                            step="10000"
                            placeholder="8500000"
                            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            {listingType === "investment"
                                ? "Valuation or funding amount sought"
                                : "Your target sale price"}
                        </p>
                        {errors.askingPrice && (
                            <p className="text-sm text-red-600 mt-1">
                                {errors.askingPrice.message as string}
                            </p>
                        )}
                    </div>
                )}

                {/* Partnership Specific Fields */}
                {!isMA && (
                    <>
                        {/* Seeking Partners */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Seeking Partners * (Select all that apply)
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {partnerTypeOptions.map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() =>
                                            toggleArrayItem(
                                                seekingPartners,
                                                option,
                                                setSeekingPartners,
                                                "seekingPartners"
                                            )
                                        }
                                        className={`px-3 py-2 text-sm border rounded-lg text-left transition-colors ${
                                            seekingPartners.includes(option)
                                                ? "bg-purple-100 border-purple-600 text-purple-900"
                                                : "border-border hover:border-purple-300"
                                        }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                            {(errors as any).seekingPartners && (
                                <p className="text-sm text-red-600 mt-1">
                                    {(errors as any).seekingPartners.message}
                                </p>
                            )}
                        </div>

                        {/* Offering Capabilities */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Offering Capabilities * (Select all that apply)
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {capabilityOptions.map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() =>
                                            toggleArrayItem(
                                                offeringCapabilities,
                                                option,
                                                setOfferingCapabilities,
                                                "offeringCapabilities"
                                            )
                                        }
                                        className={`px-3 py-2 text-sm border rounded-lg text-left transition-colors ${
                                            offeringCapabilities.includes(
                                                option
                                            )
                                                ? "bg-green-100 border-green-600 text-green-900"
                                                : "border-border hover:border-green-300"
                                        }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                            {(errors as any).offeringCapabilities && (
                                <p className="text-sm text-red-600 mt-1">
                                    {
                                        (errors as any).offeringCapabilities
                                            .message
                                    }
                                </p>
                            )}
                        </div>

                        {/* Partnership Type */}
                        <div>
                            <label
                                htmlFor="partnershipType"
                                className="block text-sm font-medium mb-2"
                            >
                                Partnership Type (Optional)
                            </label>
                            <select
                                {...register("partnershipType")}
                                id="partnershipType"
                                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                            >
                                <option value="">Select type</option>
                                <option value="technical">
                                    Technical - Co-development & Integration
                                </option>
                                <option value="strategic">
                                    Strategic - Long-term Alliance
                                </option>
                                <option value="marketing">
                                    Marketing - Co-marketing & Distribution
                                </option>
                                <option value="ecosystem">
                                    Ecosystem - Community & Network Effects
                                </option>
                                <option value="distribution">
                                    Distribution - Sales & Channel Partners
                                </option>
                                <option value="co-development">
                                    Co-development - Joint Product Development
                                </option>
                            </select>
                            {errors.partnershipType && (
                                <p className="text-sm text-red-600 mt-1">
                                    {errors.partnershipType.message as string}
                                </p>
                            )}
                        </div>
                    </>
                )}
            </div>

            <div className="flex justify-between pt-4 border-t border-border">
                <button
                    type="button"
                    onClick={onPrevious}
                    className="px-6 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                    Previous
                </button>
                <button
                    type="submit"
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                    Continue
                </button>
            </div>
        </form>
    );
}
