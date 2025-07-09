'use client';

import React from 'react';

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export type BreadcrumbConfig = {
	label: string;
	href: string;
}[];

interface BreadcrumbsProps {
	config: BreadcrumbConfig;
}

export function Breadcrumbs({ config }: BreadcrumbsProps) {
	// No need to translate here anymore, the labels are already translated in the page components

	return (
		<Breadcrumb>
			<BreadcrumbList>
				{config.map((item, index) => (
					<React.Fragment key={item.href}>
						<BreadcrumbItem className="hidden md:block">
							{index === config.length - 1 ? (
								<BreadcrumbPage>{item.label}</BreadcrumbPage>
							) : (
								<BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
							)}
						</BreadcrumbItem>
						{index < config.length - 1 && (
							<BreadcrumbSeparator className="hidden md:block" />
						)}
					</React.Fragment>
				))}
			</BreadcrumbList>
		</Breadcrumb>
	);
}
