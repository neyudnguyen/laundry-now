'use client';

import { AlertTriangle, CheckCircle, Clock, Eye, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

interface Complaint {
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
	};
	vendor: {
		shopName: string;
	};
}

const getStatusIcon = (status: Complaint['status']) => {
	switch (status) {
		case 'PENDING':
			return <Clock className="h-4 w-4" />;
		case 'IN_REVIEW':
			return <Eye className="h-4 w-4" />;
		case 'RESOLVED':
			return <CheckCircle className="h-4 w-4" />;
		case 'REJECTED':
			return <XCircle className="h-4 w-4" />;
		default:
			return <AlertTriangle className="h-4 w-4" />;
	}
};

const getStatusText = (status: Complaint['status']) => {
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

const getStatusVariant = (status: Complaint['status']) => {
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

const CustomerComplaintsPage = () => {
	const [complaints, setComplaints] = useState<Complaint[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
		null,
	);

	useEffect(() => {
		const fetchComplaints = async () => {
			try {
				setIsLoading(true);
				const response = await fetch('/api/customer/complaints');

				if (!response.ok) {
					throw new Error('Không thể tải danh sách khiếu nại');
				}

				const data = await response.json();
				setComplaints(data.complaints || []);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
			} finally {
				setIsLoading(false);
			}
		};

		fetchComplaints();
	}, []);

	if (isLoading) {
		return (
			<div className="container mx-auto py-8">
				<Card>
					<CardContent className="flex items-center justify-center py-12">
						<p>Đang tải danh sách khiếu nại...</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container mx-auto py-8">
				<Card>
					<CardContent className="flex items-center justify-center py-12">
						<p className="text-destructive">{error}</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-8 space-y-6">
			<div className="mb-6">
				<h1 className="text-2xl font-bold">Khiếu nại của tôi</h1>
				<p className="text-muted-foreground">
					Theo dõi trạng thái các khiếu nại bạn đã gửi
				</p>
			</div>

			{complaints.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
						<AlertTriangle className="h-12 w-12 text-muted-foreground" />
						<p className="text-muted-foreground text-center">
							Bạn chưa có khiếu nại nào.
						</p>
					</CardContent>
				</Card>
			) : (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<AlertTriangle className="h-5 w-5" />
							Danh sách khiếu nại
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Tiêu đề</TableHead>
										<TableHead>Đơn hàng</TableHead>
										<TableHead>Cửa hàng</TableHead>
										<TableHead>Trạng thái</TableHead>
										<TableHead>Ngày tạo</TableHead>
										<TableHead>Hành động</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{complaints.map((complaint) => (
										<TableRow key={complaint.id}>
											<TableCell className="font-medium max-w-xs">
												<div className="truncate" title={complaint.title}>
													{complaint.title}
												</div>
											</TableCell>
											<TableCell>
												<div className="space-y-1">
													<div className="font-medium">
														#{complaint.order.id.slice(-8)}
													</div>
													<div className="text-xs text-muted-foreground">
														{formatCurrency(complaint.order.totalAmount)}
													</div>
												</div>
											</TableCell>
											<TableCell>{complaint.vendor.shopName}</TableCell>
											<TableCell>
												<Badge
													variant={getStatusVariant(complaint.status)}
													className="gap-1"
												>
													{getStatusIcon(complaint.status)}
													{getStatusText(complaint.status)}
												</Badge>
											</TableCell>
											<TableCell>{formatDate(complaint.createdAt)}</TableCell>
											<TableCell>
												<Button
													variant="outline"
													size="sm"
													onClick={() => setSelectedComplaint(complaint)}
												>
													Xem chi tiết
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					</CardContent>
				</Card>
			)}

			{selectedComplaint && (
				<Dialog
					open={!!selectedComplaint}
					onOpenChange={(open) => !open && setSelectedComplaint(null)}
				>
					<DialogContent className="sm:max-w-[600px]">
						<DialogHeader>
							<DialogTitle className="flex items-center gap-2">
								<AlertTriangle className="h-5 w-5 text-orange-500" />
								Chi tiết khiếu nại
							</DialogTitle>
							<DialogDescription>
								Đơn hàng #{selectedComplaint.order.id.slice(-8)} từ{' '}
								{selectedComplaint.vendor.shopName}
							</DialogDescription>
						</DialogHeader>

						<div className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<h4 className="font-medium text-sm mb-1">Trạng thái</h4>
									<Badge
										variant={getStatusVariant(selectedComplaint.status)}
										className="gap-1"
									>
										{getStatusIcon(selectedComplaint.status)}
										{getStatusText(selectedComplaint.status)}
									</Badge>
								</div>
								<div>
									<h4 className="font-medium text-sm mb-1">Ngày tạo</h4>
									<p className="text-sm text-muted-foreground">
										{formatDate(selectedComplaint.createdAt)}
									</p>
								</div>
							</div>

							<div>
								<h4 className="font-medium text-sm mb-2">Tiêu đề</h4>
								<p className="text-sm">{selectedComplaint.title}</p>
							</div>

							<div>
								<h4 className="font-medium text-sm mb-2">Mô tả</h4>
								<div className="bg-muted/50 p-3 rounded-lg">
									<p className="text-sm whitespace-pre-wrap">
										{selectedComplaint.description}
									</p>
								</div>
							</div>

							{selectedComplaint.resolution && (
								<div>
									<h4 className="font-medium text-sm mb-2">Phản hồi</h4>
									<div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800">
										<p className="text-sm whitespace-pre-wrap">
											{selectedComplaint.resolution}
										</p>
									</div>
								</div>
							)}

							{selectedComplaint.updatedAt !== selectedComplaint.createdAt && (
								<div className="text-xs text-muted-foreground">
									Cập nhật lần cuối: {formatDate(selectedComplaint.updatedAt)}
								</div>
							)}
						</div>
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
};

export default CustomerComplaintsPage;
