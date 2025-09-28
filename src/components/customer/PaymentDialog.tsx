'use client';

import { CheckCircle, Copy, ExternalLink, QrCode } from 'lucide-react';
import Image from 'next/image';
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
import { Separator } from '@/components/ui/separator';

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
					onClose();
				}
			} catch (error) {
				console.error('Error checking payment status:', error);
			}
		}, 3000); // Kiểm tra mỗi 3 giây

		// Dừng kiểm tra sau 5 phút
		setTimeout(() => {
			clearInterval(checkInterval);
		}, 300000);
	}, [orderId, onPaymentSuccess, onClose]);

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

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
		toast.success('Đã sao chép vào clipboard!');
	};

	const openPaymentPage = () => {
		if (paymentData?.checkoutUrl) {
			window.open(paymentData.checkoutUrl, '_blank');
		}
	};

	// Kiểm tra payment link đã tồn tại khi dialog mở
	useEffect(() => {
		if (isOpen && !paymentData) {
			checkExistingPayment();
		}
	}, [isOpen, paymentData, checkExistingPayment]);

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
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

					<Separator />

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
						<div className="space-y-4">
							{/* QR Code */}
							<div className="text-center">
								<div className="relative mx-auto w-48 h-48 bg-white p-2 rounded-lg border">
									<Image
										src={paymentData.qrCode}
										alt="QR Code thanh toán"
										fill
										className="object-contain"
										unoptimized
									/>
								</div>
								<p className="text-xs text-muted-foreground mt-2">
									Quét mã QR bằng ứng dụng ngân hàng
								</p>
							</div>

							{/* Payment Info */}
							<div className="space-y-3 text-sm">
								<div className="flex justify-between">
									<span className="text-muted-foreground">Tên tài khoản:</span>
									<span className="font-medium">{paymentData.accountName}</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-muted-foreground">Số tài khoản:</span>
									<div className="flex items-center gap-2">
										<span className="font-medium">
											{paymentData.accountNumber}
										</span>
										<Button
											size="sm"
											variant="ghost"
											onClick={() => copyToClipboard(paymentData.accountNumber)}
										>
											<Copy className="h-3 w-3" />
										</Button>
									</div>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-muted-foreground">Nội dung:</span>
									<div className="flex items-center gap-2">
										<span className="font-medium text-right max-w-32 truncate">
											{paymentData.description}
										</span>
										<Button
											size="sm"
											variant="ghost"
											onClick={() => copyToClipboard(paymentData.description)}
										>
											<Copy className="h-3 w-3" />
										</Button>
									</div>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Số tiền:</span>
									<span className="font-bold text-primary">
										{formatCurrency(paymentData.amount)}
									</span>
								</div>
							</div>

							<Separator />

							{/* Action Buttons */}
							<div className="space-y-2">
								<Button
									onClick={openPaymentPage}
									className="w-full"
									variant="default"
								>
									<ExternalLink className="h-4 w-4 mr-2" />
									Mở trang thanh toán
								</Button>

								<div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
									<CheckCircle className="h-3 w-3" />
									Hệ thống sẽ tự động cập nhật khi thanh toán thành công
								</div>
							</div>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
