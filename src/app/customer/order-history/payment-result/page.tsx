'use client';

import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentResultPage() {
	const searchParams = useSearchParams();
	const payment = searchParams.get('payment');
	const orderId = searchParams.get('orderId');

	const [loading, setLoading] = useState(true);
	const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

	useEffect(() => {
		if (orderId && payment === 'success') {
			// Kiểm tra trạng thái thanh toán từ server
			const checkPaymentStatus = async () => {
				try {
					const response = await fetch(`/api/payments/status/${orderId}`);
					const result = await response.json();

					if (result.success) {
						setPaymentStatus(result.data.paymentStatus);
					}
				} catch (error) {
					console.error('Error checking payment status:', error);
				} finally {
					setLoading(false);
				}
			};

			checkPaymentStatus();
		} else {
			setLoading(false);
		}
	}, [orderId, payment]);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
					<p className="mt-2 text-sm text-muted-foreground">
						Đang kiểm tra trạng thái thanh toán...
					</p>
				</div>
			</div>
		);
	}

	const isSuccess = payment === 'success' && paymentStatus === 'COMPLETED';
	const isCancelled = payment === 'cancelled';

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					{isSuccess && (
						<>
							<div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
								<CheckCircle className="w-8 h-8 text-green-600" />
							</div>
							<CardTitle className="text-green-600">
								Thanh toán thành công!
							</CardTitle>
						</>
					)}

					{isCancelled && (
						<>
							<div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
								<XCircle className="w-8 h-8 text-red-600" />
							</div>
							<CardTitle className="text-red-600">Thanh toán đã hủy</CardTitle>
						</>
					)}

					{payment === 'success' && paymentStatus !== 'COMPLETED' && (
						<>
							<div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
								<XCircle className="w-8 h-8 text-yellow-600" />
							</div>
							<CardTitle className="text-yellow-600">
								Chưa hoàn tất thanh toán
							</CardTitle>
						</>
					)}
				</CardHeader>

				<CardContent className="text-center space-y-4">
					{isSuccess && (
						<div>
							<p className="text-muted-foreground mb-4">
								Cảm ơn bạn đã thanh toán. Đơn hàng của bạn đã được xử lý thành
								công.
							</p>
							<p className="text-sm text-muted-foreground">
								Mã đơn hàng:{' '}
								<span className="font-mono">#{orderId?.slice(-8)}</span>
							</p>
						</div>
					)}

					{isCancelled && (
						<div>
							<p className="text-muted-foreground mb-4">
								Bạn đã hủy thanh toán. Đơn hàng vẫn đang chờ thanh toán.
							</p>
							<p className="text-sm text-muted-foreground">
								Mã đơn hàng:{' '}
								<span className="font-mono">#{orderId?.slice(-8)}</span>
							</p>
						</div>
					)}

					{payment === 'success' && paymentStatus !== 'COMPLETED' && (
						<div>
							<p className="text-muted-foreground mb-4">
								Thanh toán chưa được xác nhận. Vui lòng kiểm tra lại hoặc liên
								hệ hỗ trợ.
							</p>
							<p className="text-sm text-muted-foreground">
								Mã đơn hàng:{' '}
								<span className="font-mono">#{orderId?.slice(-8)}</span>
							</p>
						</div>
					)}

					<div className="pt-4">
						<Link href="/customer/order-history" className="block mb-4">
							<Button className="w-full">
								<ArrowLeft className="w-4 h-4 mr-2" />
								Quay lại lịch sử đơn hàng
							</Button>
						</Link>

						<Link href="/customer/marketplace" className="block">
							<Button variant="outline" className="w-full">
								Tiếp tục mua sắm
							</Button>
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
