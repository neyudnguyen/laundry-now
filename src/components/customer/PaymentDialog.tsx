'use client';

import { QrCode } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
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

interface PaymentData {
	checkoutUrl: string;
	qrCode: string;
	paymentLinkId: string;
	accountNumber: string;
	accountName: string;
	amount: number;
	description: string;
}

export default function PaymentDialog({
	isOpen,
	onClose,
	orderId,
	orderAmount,
	onPaymentSuccess,
}: PaymentDialogProps) {
	const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleCancelPayment = useCallback(async () => {
		try {
			await fetch('/api/payments/cancel', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ orderId }),
			});
		} catch (error) {
			console.error('Error cancelling payment:', error);
		}
	}, [orderId]);

	const handleClose = useCallback(
		(preventCancel?: boolean) => {
			// Cancel payment if user closes dialog while payment is pending (unless prevented)
			if (paymentData && !preventCancel) {
				handleCancelPayment();
			}
			setPaymentData(null);
			setError(null);
			onClose();
		},
		[paymentData, handleCancelPayment, onClose],
	);

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND',
		}).format(amount);
	};

	const startPaymentStatusCheck = useCallback(() => {
		const checkInterval = setInterval(async () => {
			try {
				const response = await fetch(`/api/payments/status/${orderId}`);
				const result = await response.json();

				if (result.success && result.data.paymentStatus === 'COMPLETED') {
					clearInterval(checkInterval);
					toast.success('Thanh toán thành công!');
					onPaymentSuccess?.();
					handleClose(true); // Prevent cancellation when payment is successful
				}
			} catch (error) {
				console.error('Error checking payment status:', error);
			}
		}, 3000); // Kiểm tra mỗi 3 giây

		// Dừng kiểm tra sau 5 phút
		setTimeout(() => {
			clearInterval(checkInterval);
		}, 300000);
	}, [orderId, onPaymentSuccess, handleClose]);

	const checkExistingPayment = useCallback(async () => {
		try {
			const response = await fetch(`/api/payments/status/${orderId}`);
			const result = await response.json();

			if (response.ok && result.data.paymentLink) {
				// Đã có payment link, hiển thị luôn
				setPaymentData({
					checkoutUrl: result.data.paymentLink.checkoutUrl,
					qrCode: result.data.paymentLink.qrCode,
					paymentLinkId: result.data.paymentLink.paymentLinkId,
					accountNumber: result.data.paymentLink.accountNumber,
					accountName: result.data.paymentLink.accountName,
					amount: result.data.paymentLink.amount,
					description: result.data.paymentLink.description,
				});
				startPaymentStatusCheck();
			}
		} catch (error) {
			console.error('Error checking existing payment:', error);
		}
	}, [orderId, startPaymentStatusCheck]);

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
				setPaymentData(result.data);
				toast.success('Tạo link thanh toán thành công!');

				// Redirect sang checkout URL
				setTimeout(() => {
					window.open(result.data.checkoutUrl, '_blank');
					handleClose(true);
				}, 1000);

				// Bắt đầu kiểm tra trạng thái thanh toán định kỳ
				startPaymentStatusCheck();
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

	// Kiểm tra payment link đã tồn tại khi dialog mở
	useEffect(() => {
		if (isOpen && !paymentData) {
			checkExistingPayment();
		}
	}, [isOpen, paymentData, checkExistingPayment]);

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<QrCode className="h-5 w-5" />
						Thanh toán QR Code
					</DialogTitle>
					<DialogDescription>
						Quét mã QR hoặc chuyển khoản theo thông tin bên dưới
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
					{!paymentData && !loading && !error && (
						<div className="text-center space-y-4">
							<p className="text-sm text-muted-foreground">
								Nhấn nút bên dưới để tạo mã QR thanh toán
							</p>
							<Button onClick={handleCreatePayment} className="w-full">
								<QrCode className="h-4 w-4 mr-2" />
								Tạo mã QR thanh toán
							</Button>
						</div>
					)}

					{loading && (
						<div className="text-center space-y-4">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
							<p className="text-sm text-muted-foreground">
								Đang tạo mã QR thanh toán...
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

					{paymentData && (
						<div className="text-center space-y-4">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
							<p className="text-sm text-muted-foreground">
								Đang chuyển hướng tới trang thanh toán...
							</p>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
