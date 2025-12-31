'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { CampaignForm } from '@/components/dashboard/campaign-form';

export default function NewCampaignPage() {
  const router = useRouter();

  const handleSubmit = (data: any) => {
    // In a real app, this would make an API call
    console.log('Creating campaign:', data);

    // Simulate API call
    setTimeout(() => {
      alert('Campaign created successfully! (Mock data - no actual campaign created)');
      router.push('/dashboard/campaigns');
    }, 500);
  };

  const handleCancel = () => {
    router.push('/dashboard/campaigns');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Back Button */}
      <Link
        href="/dashboard/campaigns"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Campaigns
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Create New Campaign</h1>
        <p className="text-muted-foreground mt-2">
          Set up a new marketing campaign to track conversions and measure ROI
        </p>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          How Campaign Tracking Works
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Generate a unique tracking link for your campaign</li>
          <li>• Track clicks and attribute them to wallet addresses</li>
          <li>• Monitor on-chain conversions (mints, swaps, stakes, votes)</li>
          <li>• Measure ROI and conversion rates in real-time</li>
        </ul>
      </div>

      {/* Form */}
      <div className="bg-card rounded-lg border border-border p-8">
        <CampaignForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>

      {/* Help Text */}
      <div className="bg-muted rounded-lg p-6">
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Campaign Setup Tips
        </h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>Target Contract:</strong> The smart contract address you want to track interactions with
          </p>
          <p>
            <strong>Budget:</strong> Set a realistic budget based on your expected cost per conversion
          </p>
          <p>
            <strong>Goal Type:</strong> Choose what matters most - conversions, volume, or user acquisition
          </p>
          <p>
            <strong>Start Date:</strong> When your campaign will begin tracking clicks and conversions
          </p>
        </div>
      </div>
    </div>
  );
}
