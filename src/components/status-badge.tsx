'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface StatusConfig {
	[key: string]: {
		color: string;
		label: string;
	};
}

interface StatusBadgeProps {
	status: string;
	config: StatusConfig;
	size?: 'sm' | 'md' | 'lg';
	showLabel?: boolean;
	className?: string;
}

export function StatusBadge({
	status,
	config,
	size = 'sm',
	showLabel = false,
	className = '',
}: StatusBadgeProps) {
	const statusConfig = config[status];

	if (!statusConfig) {
		return null;
	}

	const sizeClasses = {
		sm: 'h-2 w-2',
		md: 'h-3 w-3',
		lg: 'h-4 w-4',
	};

	const badge = (
		<div className={`${sizeClasses[size]} rounded-full ${statusConfig.color} ${className}`} />
	);

	if (showLabel) {
		return (
			<div className="flex items-center gap-2">
				{badge}
				<span className="text-sm text-muted-foreground">{statusConfig.label}</span>
			</div>
		);
	}

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger>{badge}</TooltipTrigger>
				<TooltipContent>
					<p>{statusConfig.label}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}

// Predefined status configurations
export const consentStatusConfig: StatusConfig = {
	gave_consent: {
		color: 'bg-emerald-400',
		label: 'Gave Consent',
	},
	no_response: {
		color: 'bg-amber-400',
		label: 'No Response',
	},
	declined: {
		color: 'bg-rose-500',
		label: 'Declined',
	},
	concent_message_not_sent: {
		color: 'bg-slate-400',
		label: 'Message Not Sent',
	},
	concent_message_failed: {
		color: 'bg-red-600',
		label: 'Message Failed',
	},
};
