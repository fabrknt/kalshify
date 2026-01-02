import { CindexLayoutClient } from "@/components/cindex/cindex-layout-client";

export default function CindexLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <CindexLayoutClient>{children}</CindexLayoutClient>;
}
