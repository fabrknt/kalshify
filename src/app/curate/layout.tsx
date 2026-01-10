import { CurateLayoutClient } from "@/components/curate/curate-layout-client";

export const metadata = {
    title: "Curate | FABRKNT",
    description: "Explore Web3 project dependencies and ecosystem connections",
};

export default function CurateLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <CurateLayoutClient>{children}</CurateLayoutClient>;
}
