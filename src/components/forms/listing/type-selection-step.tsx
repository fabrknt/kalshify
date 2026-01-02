"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    TypeSelectionSchema,
    type TypeSelectionInput,
    type CreateListingInput,
} from "@/lib/schemas/listing";
import { Building2, UserPlus, Users, TrendingUp } from "lucide-react";

interface TypeSelectionStepProps {
    defaultValues: Partial<CreateListingInput>;
    onNext: (data: TypeSelectionInput) => void;
}

const listingTypes = [
    {
        value: "acquisition" as const,
        label: "Acquisition",
        description: "Sell your entire project or business",
        icon: Building2,
        color: "bg-purple-100 text-purple-600 border-purple-200",
    },
    {
        value: "investment" as const,
        label: "Investment",
        description: "Raise capital while retaining ownership",
        icon: TrendingUp,
        color: "bg-blue-100 text-blue-600 border-blue-200",
    },
    {
        value: "partnership" as const,
        label: "Partnership",
        description: "Find strategic partners for collaboration",
        icon: UserPlus,
        color: "bg-green-100 text-green-600 border-green-200",
    },
    {
        value: "collaboration" as const,
        label: "Collaboration",
        description: "Co-develop products or features together",
        icon: Users,
        color: "bg-orange-100 text-orange-600 border-orange-200",
    },
];

export function TypeSelectionStep({
    defaultValues,
    onNext,
}: TypeSelectionStepProps) {
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<TypeSelectionInput>({
        resolver: zodResolver(TypeSelectionSchema),
        defaultValues: {
            type: defaultValues.type,
        },
    });

    const selectedType = watch("type");

    const onSubmit = (data: TypeSelectionInput) => {
        onNext(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Select Listing Type</h2>
                <p className="text-muted-foreground">
                    Choose what type of opportunity you want to list
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {listingTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = selectedType === type.value;

                    return (
                        <button
                            key={type.value}
                            type="button"
                            onClick={() =>
                                setValue("type", type.value, {
                                    shouldValidate: true,
                                })
                            }
                            className={`relative p-6 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                                isSelected
                                    ? "border-purple-600 bg-purple-50 shadow-md"
                                    : "border-border hover:border-purple-300"
                            }`}
                        >
                            <div className="flex items-start gap-4">
                                <div
                                    className={`p-3 rounded-lg border ${type.color}`}
                                >
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg mb-1">
                                        {type.label}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {type.description}
                                    </p>
                                </div>
                            </div>
                            {isSelected && (
                                <div className="absolute top-4 right-4 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                                    <svg
                                        className="w-4 h-4 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {errors.type && (
                <p className="text-sm text-red-600">{errors.type.message}</p>
            )}

            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={!selectedType}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Continue
                </button>
            </div>
        </form>
    );
}
