'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { StarRating } from '@/components/ui/star-rating';
import { Textarea } from '@/components/ui/textarea';

interface ReviewDialogProps {
	orderId: string;
	vendorName: string;
	isOpen: boolean;
	onClose: () => void;
	onReviewSubmitted: () => void;
}

export function ReviewDialog({
	orderId,
	vendorName,
	isOpen,
	onClose,
	onReviewSubmitted,
}: ReviewDialogProps) {
	const [rating, setRating] = useState(0);
	const [comment, setComment] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async () => {
		if (rating === 0) {
			toast.error('Vui lòng chọn số sao đánh giá');
			return;
		}

		try {
			setIsSubmitting(true);

			const response = await fetch('/api/customer/reviews', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					orderId,
					rating,
					comment: comment.trim() || null,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Không thể gửi đánh giá');
			}

			toast.success('Đánh giá của bạn đã được gửi thành công!');
			onReviewSubmitted();
			handleClose();
		} catch (error) {
			console.error('Error submitting review:', error);
			toast.error(
				error instanceof Error
					? error.message
					: 'Có lỗi xảy ra khi gửi đánh giá',
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleClose = () => {
		setRating(0);
		setComment('');
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Đánh giá dịch vụ</DialogTitle>
				</DialogHeader>

				<div className="space-y-6">
					<div className="text-center">
						<p className="text-sm text-muted-foreground">
							Hãy đánh giá trải nghiệm của bạn với
						</p>
						<p className="font-medium">{vendorName}</p>
					</div>

					<div className="space-y-2">
						<Label>Đánh giá sao</Label>
						<div className="flex justify-center">
							<StarRating
								value={rating}
								onChange={setRating}
								size="lg"
								className="justify-center"
							/>
						</div>
						{rating > 0 && (
							<p className="text-center text-sm text-muted-foreground">
								{rating === 1 && 'Rất không hài lòng'}
								{rating === 2 && 'Không hài lòng'}
								{rating === 3 && 'Bình thường'}
								{rating === 4 && 'Hài lòng'}
								{rating === 5 && 'Rất hài lòng'}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="comment">Nhận xét (tùy chọn)</Label>
						<Textarea
							id="comment"
							placeholder="Chia sẻ trải nghiệm của bạn về dịch vụ..."
							value={comment}
							onChange={(e) => setComment(e.target.value)}
							rows={4}
							maxLength={500}
						/>
						<p className="text-xs text-muted-foreground text-right">
							{comment.length}/500
						</p>
					</div>

					<div className="flex gap-3 pt-4">
						<Button
							variant="outline"
							onClick={handleClose}
							disabled={isSubmitting}
							className="flex-1"
						>
							Hủy
						</Button>
						<Button
							onClick={handleSubmit}
							disabled={isSubmitting || rating === 0}
							className="flex-1"
						>
							{isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
