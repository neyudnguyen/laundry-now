'use client';

import { CheckCircle, Eye, MessageSquare, XCircle } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface VendorComplaint {
	id: string;
	title: string;
	description: string;
	status: 'PENDING' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED';
	resolution?: string | null;
	createdAt: string;
	updatedAt: string;
	order: {
		id: string;
		createdAt: string;
		totalAmount: number;
		status: string;
	};
	customer: {
		fullName: string;
		phone: string;
	};
}

interface ComplaintResponseDialogProps {
	complaint: VendorComplaint;
	isOpen: boolean;
	onClose: () => void;
	onComplaintUpdated: () => void;
}

const getStatusIcon = (status: VendorComplaint['status']) => {
	switch (status) {
		case 'PENDING':
			return <MessageSquare className="h-4 w-4" />;
		case 'IN_REVIEW':
			return <Eye className="h-4 w-4" />;
		case 'RESOLVED':
			return <CheckCircle className="h-4 w-4" />;
		case 'REJECTED':
			return <XCircle className="h-4 w-4" />;
		default:
			return <MessageSquare className="h-4 w-4" />;
	}
};

const getStatusText = (status: VendorComplaint['status']) => {
	switch (status) {
		case 'PENDING':
			return 'Chờ xử lý';
		case 'IN_REVIEW':
			return 'Đang xem xét';
		case 'RESOLVED':
			return 'Đã giải quyết';
		case 'REJECTED':
			return 'Từ chối';
		default:
			return status;
	}
};

const getStatusVariant = (status: VendorComplaint['status']) => {
	switch (status) {
		case 'PENDING':
			return 'secondary';
		case 'IN_REVIEW':
			return 'default';
		case 'RESOLVED':
			return 'default';
		case 'REJECTED':
			return 'destructive';
		default:
			return 'secondary';
	}
};

export function ComplaintResponseDialog({
	complaint,
	isOpen,
	onClose,
	onComplaintUpdated,
}: ComplaintResponseDialogProps) {
	const [selectedStatus, setSelectedStatus] = useState<
		'IN_REVIEW' | 'RESOLVED' | 'REJECTED'
	>('IN_REVIEW');
	const [resolution, setResolution] = useState(complaint.resolution || '');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { toast } = useToast();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (selectedStatus === 'RESOLVED' && !resolution.trim()) {
			toast.error('Lỗi', {
				description: 'Vui lòng nhập phản hồi khi giải quyết khiếu nại',
			});
			return;
		}

		setIsSubmitting(true);

		try {
			const response = await fetch('/api/vendor/complaints', {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					complaintId: complaint.id,
					status: selectedStatus,
					resolution: resolution.trim() || undefined,
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Có lỗi xảy ra khi cập nhật khiếu nại');
			}

			toast.success('Thành công', {
				description: 'Cập nhật khiếu nại thành công',
			});

			onComplaintUpdated();
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
		setSelectedStatus('IN_REVIEW');
		setResolution(complaint.resolution || '');
		onClose();
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND',
		}).format(amount);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('vi-VN', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<MessageSquare className="h-5 w-5 text-orange-500" />
						Xử lý khiếu nại
					</DialogTitle>
					<DialogDescription>
						Từ khách hàng {complaint.customer.fullName} • Đơn hàng #
						{complaint.order.id.slice(-8)}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{/* Thông tin đơn hàng */}
					<div className="bg-muted/50 p-4 rounded-lg space-y-2">
						<h4 className="font-medium text-sm">Thông tin đơn hàng</h4>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
							<div>
								<span className="text-muted-foreground">Mã đơn hàng:</span> #
								{complaint.order.id.slice(-8)}
							</div>
							<div>
								<span className="text-muted-foreground">Giá trị:</span>{' '}
								{formatCurrency(complaint.order.totalAmount)}
							</div>
							<div>
								<span className="text-muted-foreground">Khách hàng:</span>{' '}
								{complaint.customer.fullName}
							</div>
							<div>
								<span className="text-muted-foreground">SĐT:</span>{' '}
								{complaint.customer.phone}
							</div>
						</div>
					</div>

					{/* Thông tin khiếu nại */}
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<h4 className="font-medium text-sm">Thông tin khiếu nại</h4>
							<Badge
								variant={getStatusVariant(complaint.status)}
								className="gap-1"
							>
								{getStatusIcon(complaint.status)}
								{getStatusText(complaint.status)}
							</Badge>
						</div>

						<div>
							<Label className="text-sm font-medium">Tiêu đề</Label>
							<p className="text-sm mt-1">{complaint.title}</p>
						</div>

						<div>
							<Label className="text-sm font-medium">Mô tả chi tiết</Label>
							<div className="bg-muted/50 p-3 rounded-lg mt-1">
								<p className="text-sm whitespace-pre-wrap">
									{complaint.description}
								</p>
							</div>
						</div>

						<div className="text-xs text-muted-foreground">
							Ngày tạo: {formatDate(complaint.createdAt)}
						</div>
					</div>

					{/* Form xử lý */}
					{complaint.status !== 'RESOLVED' &&
						complaint.status !== 'REJECTED' && (
							<form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
								<div className="space-y-3">
									<Label className="text-sm font-medium">
										Trạng thái xử lý
									</Label>
									<Select
										value={selectedStatus}
										onValueChange={(
											value: 'IN_REVIEW' | 'RESOLVED' | 'REJECTED',
										) => setSelectedStatus(value)}
										disabled={isSubmitting}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="IN_REVIEW">
												<div className="flex items-center gap-2">
													<Eye className="h-4 w-4" />
													Đang xem xét
												</div>
											</SelectItem>
											<SelectItem value="RESOLVED">
												<div className="flex items-center gap-2">
													<CheckCircle className="h-4 w-4" />
													Giải quyết
												</div>
											</SelectItem>
											<SelectItem value="REJECTED">
												<div className="flex items-center gap-2">
													<XCircle className="h-4 w-4" />
													Từ chối
												</div>
											</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-2">
									<Label htmlFor="resolution">
										Phản hồi{' '}
										{selectedStatus === 'RESOLVED' && (
											<span className="text-destructive">*</span>
										)}
									</Label>
									<Textarea
										id="resolution"
										value={resolution}
										onChange={(e) => setResolution(e.target.value)}
										placeholder={
											selectedStatus === 'RESOLVED'
												? 'Mô tả cách bạn đã giải quyết khiếu nại này...'
												: selectedStatus === 'REJECTED'
													? 'Lý do từ chối khiếu nại...'
													: 'Ghi chú về quá trình xem xét...'
										}
										rows={4}
										disabled={isSubmitting}
										required={selectedStatus === 'RESOLVED'}
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
											<CheckCircle className="h-4 w-4" />
										)}
										{isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
									</Button>
								</DialogFooter>
							</form>
						)}

					{/* Hiển thị phản hồi đã có */}
					{complaint.resolution && (
						<div className="border-t pt-4">
							<Label className="text-sm font-medium">Phản hồi của bạn</Label>
							<div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800 mt-2">
								<p className="text-sm whitespace-pre-wrap">
									{complaint.resolution}
								</p>
							</div>
							{complaint.updatedAt !== complaint.createdAt && (
								<div className="text-xs text-muted-foreground mt-2">
									Cập nhật: {formatDate(complaint.updatedAt)}
								</div>
							)}
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
