'use client';

import { QrCode } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';

interface PaymentDialogProps {
	isOpen: boolean;
	onClose: () => void;
	orderId: string;
	orderAmount: number;
	onPaymentSuccess?: () => void;
}

export default function PaymentDialog({
	isOpen,
	onClose,
	orderId,
	orderAmount,
}: PaymentDialogProps) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND',
		}).format(amount);
	};

	const handleCreatePayment = async () => {
		setLoading(true);
		setError(null);

		try {
			const response = await fetch('/api/payments/create', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ orderId }),
			});

			const result = await response.json();

			if (response.ok) {
				toast.success('Đang chuyển hướng tới trang thanh toán...');

				// Redirect trực tiếp tới checkout URL (không mở tab mới)
				window.location.href = result.data.checkoutUrl;
			} else {
				setError(result.error || 'Không thể tạo link thanh toán');
				toast.error(result.error || 'Không thể tạo link thanh toán');
			}
		} catch {
			setError('Có lỗi xảy ra khi tạo link thanh toán');
			toast.error('Có lỗi xảy ra khi tạo link thanh toán');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<QrCode className="h-5 w-5" />
						Thanh toán QR Code
					</DialogTitle>
					<DialogDescription>
						Bạn sẽ được chuyển hướng tới trang thanh toán của PayOS
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{/* Order Info */}
					<div className="text-center">
						<p className="text-sm text-muted-foreground">
							Số tiền cần thanh toán
						</p>
						<p className="text-2xl font-bold text-primary">
							{formatCurrency(orderAmount)}
						</p>
					</div>

					{/* Payment Content */}
					{!loading && !error && (
						<div className="text-center space-y-4">
							<p className="text-sm text-muted-foreground">
								Nhấn nút bên dưới để tiến hành thanh toán
							</p>
							<Button onClick={handleCreatePayment} className="w-full">
								<QrCode className="h-4 w-4 mr-2" />
								Thanh toán ngay
							</Button>
						</div>
					)}

					{loading && (
						<div className="text-center space-y-4">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
							<p className="text-sm text-muted-foreground">
								Đang tạo link thanh toán...
							</p>
						</div>
					)}

					{error && (
						<div className="text-center space-y-4">
							<div className="text-destructive text-sm">{error}</div>
							<Button
								onClick={handleCreatePayment}
								variant="outline"
								className="w-full"
							>
								Thử lại
							</Button>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
