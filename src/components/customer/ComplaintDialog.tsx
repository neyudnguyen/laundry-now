'use client';

import { AlertTriangle, Send } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface ComplaintDialogProps {
	orderId: string;
	vendorName: string;
	isOpen: boolean;
	onClose: () => void;
	onComplaintSubmitted: () => void;
}

export function ComplaintDialog({
	orderId,
	vendorName,
	isOpen,
	onClose,
	onComplaintSubmitted,
}: ComplaintDialogProps) {
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { toast } = useToast();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!title.trim() || !description.trim()) {
			toast.error('Lỗi', {
				description: 'Vui lòng điền đầy đủ thông tin khiếu nại',
			});
			return;
		}

		setIsSubmitting(true);

		try {
			const response = await fetch('/api/customer/complaints', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					orderId,
					title: title.trim(),
					description: description.trim(),
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Có lỗi xảy ra khi gửi khiếu nại');
			}

			toast.success('Thành công', {
				description: 'Khiếu nại của bạn đã được gửi thành công',
			});

			setTitle('');
			setDescription('');
			onComplaintSubmitted();
			onClose();
		} catch (error) {
			toast.error('Lỗi', {
				description: error instanceof Error ? error.message : 'Có lỗi xảy ra',
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleClose = () => {
		setTitle('');
		setDescription('');
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[425px] md:max-w-[500px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<AlertTriangle className="h-5 w-5 text-orange-500" />
						Gửi khiếu nại
					</DialogTitle>
					<DialogDescription>
						Gửi khiếu nại về đơn hàng #{orderId.slice(-8)} từ cửa hàng{' '}
						<span className="font-medium">{vendorName}</span>
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="title">Tiêu đề khiếu nại</Label>
						<Input
							id="title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="Vd: Quần áo bị hỏng sau khi giặt"
							disabled={isSubmitting}
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Mô tả chi tiết</Label>
						<Textarea
							id="description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Mô tả chi tiết về vấn đề bạn gặp phải với đơn hàng này..."
							rows={4}
							disabled={isSubmitting}
							required
						/>
					</div>

					<DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:space-x-2">
						<Button
							type="button"
							variant="outline"
							onClick={handleClose}
							disabled={isSubmitting}
							className="w-full sm:w-auto"
						>
							Hủy
						</Button>
						<Button
							type="submit"
							disabled={isSubmitting}
							className="gap-2 w-full sm:w-auto"
						>
							{isSubmitting ? (
								<div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
							) : (
								<Send className="h-4 w-4" />
							)}
							{isSubmitting ? 'Đang gửi...' : 'Gửi khiếu nại'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
