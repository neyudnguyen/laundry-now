'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';

interface StarRatingProps {
	value: number;
	onChange?: (value: number) => void;
	readonly?: boolean;
	size?: 'sm' | 'md' | 'lg';
	className?: string;
}

export function StarRating({
	value,
	onChange,
	readonly = false,
	size = 'md',
	className,
}: StarRatingProps) {
	const [hoveredValue, setHoveredValue] = useState<number | null>(null);

	const sizeClasses = {
		sm: 'h-4 w-4',
		md: 'h-5 w-5',
		lg: 'h-6 w-6',
	};

	const displayValue = hoveredValue !== null ? hoveredValue : value;

	return (
		<div className={cn('flex items-center gap-1', className)}>
			{[1, 2, 3, 4, 5].map((star) => (
				<button
					key={star}
					type="button"
					disabled={readonly}
					className={cn(
						'transition-colors',
						!readonly && 'hover:scale-110 cursor-pointer',
						readonly && 'cursor-default',
						sizeClasses[size],
					)}
					onMouseEnter={() => !readonly && setHoveredValue(star)}
					onMouseLeave={() => !readonly && setHoveredValue(null)}
					onClick={() => !readonly && onChange?.(star)}
				>
					<Star
						className={cn(
							'transition-colors',
							star <= displayValue
								? 'fill-yellow-400 text-yellow-400'
								: 'text-muted-foreground',
							sizeClasses[size],
						)}
					/>
				</button>
			))}
		</div>
	);
}
