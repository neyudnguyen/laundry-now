'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

// This component is for testing notifications in development
// Remove this in production or add proper security checks
export function NotificationTester() {
	const [loading, setLoading] = useState(false);
	const [notificationType, setNotificationType] = useState<'custom' | 'order'>(
		'custom',
	);
	const [orderType, setOrderType] = useState('confirmed');
	const [customMessage, setCustomMessage] = useState('');
	const [orderNumber, setOrderNumber] = useState('');
	const [amount, setAmount] = useState('');
	const [reason, setReason] = useState('');

	const createTestNotification = async () => {
		if (!customMessage && notificationType === 'custom') {
			toast.error('Vui lòng nhập nội dung thông báo');
			return;
		}

		if (!orderNumber && notificationType === 'order') {
			toast.error('Vui lòng nhập số đơn hàng');
			return;
		}

		setLoading(true);
		try {
			const requestBody = {
				type: notificationType === 'custom' ? 'custom' : orderType,
				message: notificationType === 'custom' ? customMessage : undefined,
				orderNumber: notificationType === 'order' ? orderNumber : undefined,
				amount: amount ? parseInt(amount) : undefined,
				reason: reason || undefined,
			};

			const response = await fetch('/api/notifications/test', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(requestBody),
			});

			if (!response.ok) {
				throw new Error('Failed to create notification');
			}

			toast.success('Thông báo đã được tạo thành công!');

			// Reset form
			setCustomMessage('');
			setOrderNumber('');
			setAmount('');
			setReason('');
		} catch (error) {
			console.error('Error creating notification:', error);
			toast.error('Không thể tạo thông báo');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle>Test Notifications</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<Label>Loại thông báo</Label>
					<Select
						value={notificationType}
						onValueChange={(value: 'custom' | 'order') =>
							setNotificationType(value)
						}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="custom">Thông báo tùy chỉnh</SelectItem>
							<SelectItem value="order">Thông báo đơn hàng</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{notificationType === 'custom' && (
					<div className="space-y-2">
						<Label htmlFor="message">Nội dung thông báo</Label>
						<Textarea
							id="message"
							placeholder="Nhập nội dung thông báo..."
							value={customMessage}
							onChange={(e) => setCustomMessage(e.target.value)}
						/>
					</div>
				)}

				{notificationType === 'order' && (
					<>
						<div className="space-y-2">
							<Label>Loại thông báo đơn hàng</Label>
							<Select value={orderType} onValueChange={setOrderType}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="confirmed">Đã xác nhận</SelectItem>
									<SelectItem value="picked_up">Đã lấy đồ</SelectItem>
									<SelectItem value="in_washing">Đang giặt</SelectItem>
									<SelectItem value="payment_required">
										Cần thanh toán
									</SelectItem>
									<SelectItem value="completed">Hoàn thành</SelectItem>
									<SelectItem value="cancelled">Đã hủy</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="orderNumber">Số đơn hàng</Label>
							<Input
								id="orderNumber"
								placeholder="VD: DH001"
								value={orderNumber}
								onChange={(e) => setOrderNumber(e.target.value)}
							/>
						</div>

						{orderType === 'payment_required' && (
							<div className="space-y-2">
								<Label htmlFor="amount">Số tiền (VND)</Label>
								<Input
									id="amount"
									type="number"
									placeholder="VD: 50000"
									value={amount}
									onChange={(e) => setAmount(e.target.value)}
								/>
							</div>
						)}

						{orderType === 'cancelled' && (
							<div className="space-y-2">
								<Label htmlFor="reason">Lý do hủy (tùy chọn)</Label>
								<Input
									id="reason"
									placeholder="VD: Khách hàng yêu cầu"
									value={reason}
									onChange={(e) => setReason(e.target.value)}
								/>
							</div>
						)}
					</>
				)}

				<Button
					onClick={createTestNotification}
					disabled={loading}
					className="w-full"
				>
					{loading ? 'Đang tạo...' : 'Tạo thông báo test'}
				</Button>
			</CardContent>
		</Card>
	);
}
