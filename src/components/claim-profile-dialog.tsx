"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Github, Globe, Wallet, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ClaimProfileDialogProps {
  companySlug: string;
  companyName: string;
  githubOrg?: string;
  website?: string;
  onSuccess: () => void;
}

export function ClaimProfileDialog({
  companySlug,
  companyName,
  githubOrg,
  website,
  onSuccess,
}: ClaimProfileDialogProps) {
  const [loading, setLoading] = useState(false);
  const [githubUsername, setGithubUsername] = useState("");
  const { toast } = useToast();

  const handleGitHubClaim = async () => {
    if (!githubUsername.trim()) {
      toast({
        title: "Error",
        description: "Please enter your GitHub username",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/profiles/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companySlug,
          verificationType: "github",
          verificationData: {
            githubUsername: githubUsername.trim(),
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Verification failed");
      }

      toast({
        title: "Success!",
        description: `You've successfully claimed ${companyName}`,
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDomainClaim = async () => {
    toast({
      title: "Coming Soon",
      description: "Domain verification will be available soon. Use GitHub verification for now.",
    });
  };

  const handleWalletClaim = async () => {
    toast({
      title: "Coming Soon",
      description: "Wallet verification will be available soon. Use GitHub verification for now.",
    });
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="github" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="github">
            <Github className="mr-2 h-4 w-4" />
            GitHub
          </TabsTrigger>
          <TabsTrigger value="domain" disabled>
            <Globe className="mr-2 h-4 w-4" />
            Domain
          </TabsTrigger>
          <TabsTrigger value="wallet" disabled>
            <Wallet className="mr-2 h-4 w-4" />
            Wallet
          </TabsTrigger>
        </TabsList>

        {/* GitHub Verification */}
        <TabsContent value="github" className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">Verify via GitHub</h4>
            <p className="text-sm text-muted-foreground">
              Prove you're a member of the{" "}
              <code className="bg-muted px-1 rounded">{githubOrg}</code> GitHub
              organization.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="github-username">Your GitHub Username</Label>
              <Input
                id="github-username"
                placeholder="octocat"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Must be a member of the {githubOrg} organization
              </p>
            </div>

            <div className="bg-muted p-3 rounded-lg space-y-2">
              <p className="text-sm font-medium">How it works:</p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>We check if your GitHub user is a member of {githubOrg}</li>
                <li>If verified, you can claim this profile</li>
                <li>You'll get access to partnership matching features</li>
              </ol>
            </div>

            <Button
              onClick={handleGitHubClaim}
              disabled={loading || !githubUsername.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Verify & Claim Profile
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        {/* Domain Verification */}
        <TabsContent value="domain" className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">Verify via Domain</h4>
            <p className="text-sm text-muted-foreground">
              Add a TXT record to your domain to prove ownership.
            </p>
          </div>

          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm">
              This verification method is coming soon. Please use GitHub
              verification for now.
            </p>
          </div>

          <Button onClick={handleDomainClaim} disabled className="w-full">
            Coming Soon
          </Button>
        </TabsContent>

        {/* Wallet Verification */}
        <TabsContent value="wallet" className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">Verify via Wallet</h4>
            <p className="text-sm text-muted-foreground">
              Sign a message with your company's treasury wallet.
            </p>
          </div>

          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm">
              This verification method is coming soon. Please use GitHub
              verification for now.
            </p>
          </div>

          <Button onClick={handleWalletClaim} disabled className="w-full">
            Coming Soon
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
