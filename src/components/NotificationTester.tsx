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
	const [testType, setTestType] = useState<
		'notification' | 'payment' | 'complaint' | 'message'
	>('notification');
	const [notificationType, setNotificationType] = useState<'custom' | 'order'>(
		'custom',
	);
	const [orderType, setOrderType] = useState('confirmed');
	const [customMessage, setCustomMessage] = useState('');
	const [orderNumber, setOrderNumber] = useState('');
	const [amount, setAmount] = useState('');
	const [reason, setReason] = useState('');
	const [recipientId, setRecipientId] = useState('');
	const [subject, setSubject] = useState('');

	const createTestAction = async () => {
		if (testType === 'notification') {
			if (!customMessage && notificationType === 'custom') {
				toast.error('Vui lòng nhập nội dung thông báo');
				return;
			}

			if (!orderNumber && notificationType === 'order') {
				toast.error('Vui lòng nhập số đơn hàng');
				return;
			}
		}

		setLoading(true);
		try {
			let response;

			if (testType === 'notification') {
				const requestBody = {
					type: notificationType === 'custom' ? 'custom' : orderType,
					message: notificationType === 'custom' ? customMessage : undefined,
					orderNumber: notificationType === 'order' ? orderNumber : undefined,
					amount: amount ? parseInt(amount) : undefined,
					reason: reason || undefined,
				};

				response = await fetch('/api/notifications/test', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(requestBody),
				});
			} else if (testType === 'payment') {
				if (!orderNumber) {
					toast.error('Vui lòng nhập mã đơn hàng');
					return;
				}

				response = await fetch(`/api/orders/${orderNumber}/payment`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						paymentMethod: 'COD',
						amount: amount ? parseInt(amount) : 0,
					}),
				});
			} else if (testType === 'complaint') {
				if (!orderNumber || !subject || !customMessage) {
					toast.error('Vui lòng nhập đầy đủ thông tin khiếu nại');
					return;
				}

				response = await fetch('/api/complaints', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						orderId: orderNumber,
						subject: subject,
						message: customMessage,
						type: 'complaint',
					}),
				});
			} else if (testType === 'message') {
				if (!recipientId || !customMessage) {
					toast.error('Vui lòng nhập ID người nhận và nội dung tin nhắn');
					return;
				}

				response = await fetch('/api/messages', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						recipientId: recipientId,
						message: customMessage,
						orderId: orderNumber || undefined,
					}),
				});
			}

			if (!response || !response.ok) {
				throw new Error(`Failed to ${testType}`);
			}

			toast.success(`${testType} đã được thực hiện thành công!`);

			// Reset form
			setCustomMessage('');
			setOrderNumber('');
			setAmount('');
			setReason('');
			setRecipientId('');
			setSubject('');
		} catch (error) {
			console.error(`Error with ${testType}:`, error);
			toast.error(`Không thể thực hiện ${testType}`);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle>Test Notifications & Actions</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<Label>Loại test</Label>
					<Select
						value={testType}
						onValueChange={(value: typeof testType) => setTestType(value)}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="notification">Thông báo</SelectItem>
							<SelectItem value="payment">Thanh toán</SelectItem>
							<SelectItem value="complaint">Khiếu nại</SelectItem>
							<SelectItem value="message">Tin nhắn</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{testType === 'notification' && (
					<>
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

						{notificationType === 'order' && (
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
						)}
					</>
				)}

				{(testType === 'notification' && notificationType === 'order') ||
				testType === 'payment' ||
				testType === 'complaint' ||
				testType === 'message' ? (
					<div className="space-y-2">
						<Label htmlFor="orderNumber">
							{testType === 'message'
								? 'Mã đơn hàng (tùy chọn)'
								: 'Mã đơn hàng'}
						</Label>
						<Input
							id="orderNumber"
							placeholder="VD: clwuz1234..."
							value={orderNumber}
							onChange={(e) => setOrderNumber(e.target.value)}
						/>
					</div>
				) : null}

				{testType === 'message' && (
					<div className="space-y-2">
						<Label htmlFor="recipientId">ID người nhận</Label>
						<Input
							id="recipientId"
							placeholder="User ID của người nhận"
							value={recipientId}
							onChange={(e) => setRecipientId(e.target.value)}
						/>
					</div>
				)}

				{testType === 'complaint' && (
					<div className="space-y-2">
						<Label htmlFor="subject">Tiêu đề khiếu nại</Label>
						<Input
							id="subject"
							placeholder="VD: Chất lượng dịch vụ không tốt"
							value={subject}
							onChange={(e) => setSubject(e.target.value)}
						/>
					</div>
				)}

				{((testType === 'notification' && notificationType === 'custom') ||
					testType === 'complaint' ||
					testType === 'message') && (
					<div className="space-y-2">
						<Label htmlFor="message">
							{testType === 'message'
								? 'Nội dung tin nhắn'
								: testType === 'complaint'
									? 'Nội dung khiếu nại'
									: 'Nội dung thông báo'}
						</Label>
						<Textarea
							id="message"
							placeholder={`Nhập ${
								testType === 'message'
									? 'tin nhắn'
									: testType === 'complaint'
										? 'khiếu nại'
										: 'thông báo'
							}...`}
							value={customMessage}
							onChange={(e) => setCustomMessage(e.target.value)}
						/>
					</div>
				)}

				{((testType === 'notification' &&
					notificationType === 'order' &&
					orderType === 'payment_required') ||
					testType === 'payment') && (
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

				{testType === 'notification' &&
					notificationType === 'order' &&
					orderType === 'cancelled' && (
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

				<Button
					onClick={createTestAction}
					disabled={loading}
					className="w-full"
				>
					{loading ? 'Đang xử lý...' : `Test ${testType}`}
				</Button>
			</CardContent>
		</Card>
	);
}
