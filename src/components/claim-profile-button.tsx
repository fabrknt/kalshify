"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ClaimProfileDialog } from "./claim-profile-dialog";
import { CheckCircle2 } from "lucide-react";

interface ClaimProfileButtonProps {
  companySlug: string;
  companyName: string;
  githubOrg?: string;
  website?: string;
}

export function ClaimProfileButton({
  companySlug,
  companyName,
  githubOrg,
  website,
}: ClaimProfileButtonProps) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [claimed, setClaimed] = useState(false);

  // Check if profile is already claimed (on mount)
  // In a real app, you'd fetch this from the API

  if (claimed) {
    return (
      <Button variant="outline" disabled>
        <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
        Profile Claimed
      </Button>
    );
  }

  if (!session) {
    return (
      <Button variant="default" asChild>
        <a href="/auth/signin?callbackUrl=/claim-profile">
          Sign In to Claim Profile
        </a>
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="lg">
          Claim This Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Claim {companyName} Profile</DialogTitle>
          <DialogDescription>
            Prove ownership of this company to claim the profile and access
            partnership matching features.
          </DialogDescription>
        </DialogHeader>
        <ClaimProfileDialog
          companySlug={companySlug}
          companyName={companyName}
          githubOrg={githubOrg}
          website={website}
          onSuccess={() => {
            setClaimed(true);
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
