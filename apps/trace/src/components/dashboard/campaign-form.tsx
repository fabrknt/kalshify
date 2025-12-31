'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@fabrknt/ui';
import { cn } from '@fabrknt/ui';

const campaignSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100, 'Name is too long'),
  targetContract: z.string().min(5, 'Invalid contract address'),
  chain: z.enum(['ethereum', 'base', 'polygon', 'solana']),
  budgetUsd: z.number().min(100, 'Minimum budget is $100').max(1000000, 'Maximum budget is $1,000,000'),
  goalType: z.enum(['conversions', 'volume', 'users']),
  goalValue: z.number().min(1).optional(),
  startDate: z.string(),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

export interface CampaignFormProps {
  onSubmit: (data: CampaignFormData) => void;
  onCancel?: () => void;
  initialData?: Partial<CampaignFormData>;
  isLoading?: boolean;
}

export function CampaignForm({
  onSubmit,
  onCancel,
  initialData,
  isLoading = false,
}: CampaignFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: initialData || {
      chain: 'ethereum',
      goalType: 'conversions',
      startDate: new Date().toISOString().split('T')[0],
    },
  });

  const selectedChain = watch('chain');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Campaign Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground/90 mb-2">
          Campaign Name *
        </label>
        <input
          {...register('name')}
          type="text"
          id="name"
          className={cn(
            'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500',
            errors.name ? 'border-red-500' : 'border-gray-300'
          )}
          placeholder="e.g., NFT Mint Launch Campaign"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Chain Selection */}
      <div>
        <label htmlFor="chain" className="block text-sm font-medium text-foreground/90 mb-2">
          Blockchain *
        </label>
        <select
          {...register('chain')}
          id="chain"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="ethereum">Ethereum</option>
          <option value="base">Base</option>
          <option value="polygon">Polygon</option>
          <option value="solana">Solana</option>
        </select>
      </div>

      {/* Target Contract */}
      <div>
        <label htmlFor="targetContract" className="block text-sm font-medium text-foreground/90 mb-2">
          Target Contract Address *
        </label>
        <input
          {...register('targetContract')}
          type="text"
          id="targetContract"
          className={cn(
            'w-full px-3 py-2 border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-500',
            errors.targetContract ? 'border-red-500' : 'border-gray-300'
          )}
          placeholder={selectedChain === 'solana' ? 'FnKt...2x9Q' : '0x1234...5678'}
        />
        {errors.targetContract && (
          <p className="mt-1 text-sm text-red-600">{errors.targetContract.message}</p>
        )}
      </div>

      {/* Budget */}
      <div>
        <label htmlFor="budgetUsd" className="block text-sm font-medium text-foreground/90 mb-2">
          Budget (USD) *
        </label>
        <div className="relative">
          <span className="absolute left-3 top-2 text-muted-foreground/75">$</span>
          <input
            {...register('budgetUsd', { valueAsNumber: true })}
            type="number"
            id="budgetUsd"
            step="100"
            className={cn(
              'w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500',
              errors.budgetUsd ? 'border-red-500' : 'border-gray-300'
            )}
            placeholder="10000"
          />
        </div>
        {errors.budgetUsd && (
          <p className="mt-1 text-sm text-red-600">{errors.budgetUsd.message}</p>
        )}
      </div>

      {/* Goal Type */}
      <div>
        <label htmlFor="goalType" className="block text-sm font-medium text-foreground/90 mb-2">
          Goal Type *
        </label>
        <select
          {...register('goalType')}
          id="goalType"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="conversions">Conversions</option>
          <option value="volume">Transaction Volume</option>
          <option value="users">User Acquisition</option>
        </select>
      </div>

      {/* Goal Value */}
      <div>
        <label htmlFor="goalValue" className="block text-sm font-medium text-foreground/90 mb-2">
          Goal Value (Optional)
        </label>
        <input
          {...register('goalValue', { valueAsNumber: true })}
          type="number"
          id="goalValue"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="e.g., 500 conversions"
        />
        <p className="mt-1 text-xs text-muted-foreground/75">
          Target number to achieve for this campaign
        </p>
      </div>

      {/* Start Date */}
      <div>
        <label htmlFor="startDate" className="block text-sm font-medium text-foreground/90 mb-2">
          Start Date *
        </label>
        <input
          {...register('startDate')}
          type="date"
          id="startDate"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-4 border-t border-border">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          {isLoading ? 'Creating...' : 'Create Campaign'}
        </Button>
      </div>
    </form>
  );
}
