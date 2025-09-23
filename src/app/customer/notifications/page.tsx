'use client';

import { Bell, Check, CheckCheck, MoreVertical, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

interface Notification {
	id: string;
	message: string;
	isRead: boolean;
	createdAt: string;
}

interface NotificationResponse {
	notifications: Notification[];
	pagination: {
		page: number;
		limit: number;
		totalCount: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
	};
}

export default function CustomerNotificationsPage() {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [pagination, setPagination] = useState({
		page: 1,
		totalPages: 1,
		hasNext: false,
	});
	const [filter, setFilter] = useState<'all' | 'unread'>('all');

	const loadNotifications = useCallback(
		async (page = 1, reset = true) => {
			try {
				if (page === 1) {
					setLoading(true);
				} else {
					setLoadingMore(true);
				}

				const params = new URLSearchParams({
					page: page.toString(),
					limit: '20',
					...(filter === 'unread' && { unreadOnly: 'true' }),
				});

				const response = await fetch(`/api/notifications?${params}`);
				if (!response.ok) {
					throw new Error('Failed to load notifications');
				}

				const data: NotificationResponse = await response.json();

				if (reset) {
					setNotifications(data.notifications);
				} else {
					setNotifications((prev) => [...prev, ...data.notifications]);
				}

				setPagination({
					page: data.pagination.page,
					totalPages: data.pagination.totalPages,
					hasNext: data.pagination.hasNext,
				});
			} catch (error) {
				console.error('Error loading notifications:', error);
				toast.error('Không thể tải thông báo');
			} finally {
				setLoading(false);
				setLoadingMore(false);
			}
		},
		[filter],
	);

	const markAsRead = async (notificationId: string) => {
		try {
			const response = await fetch(`/api/notifications/${notificationId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ isRead: true }),
			});

			if (!response.ok) {
				throw new Error('Failed to mark as read');
			}

			setNotifications((prev) =>
				prev.map((notification) =>
					notification.id === notificationId
						? { ...notification, isRead: true }
						: notification,
				),
			);

			toast.success('Đã đánh dấu là đã đọc');
		} catch (error) {
			console.error('Error marking as read:', error);
			toast.error('Không thể đánh dấu là đã đọc');
		}
	};

	const markAllAsRead = async () => {
		try {
			const response = await fetch('/api/notifications/mark-all-read', {
				method: 'POST',
			});

			if (!response.ok) {
				throw new Error('Failed to mark all as read');
			}

			setNotifications((prev) =>
				prev.map((notification) => ({ ...notification, isRead: true })),
			);

			toast.success('Đã đánh dấu tất cả thông báo là đã đọc');
		} catch (error) {
			console.error('Error marking all as read:', error);
			toast.error('Không thể đánh dấu tất cả là đã đọc');
		}
	};

	const deleteNotification = async (notificationId: string) => {
		try {
			const response = await fetch(`/api/notifications/${notificationId}`, {
				method: 'DELETE',
			});

			if (!response.ok) {
				throw new Error('Failed to delete notification');
			}

			setNotifications((prev) =>
				prev.filter((notification) => notification.id !== notificationId),
			);

			toast.success('Đã xóa thông báo');
		} catch (error) {
			console.error('Error deleting notification:', error);
			toast.error('Không thể xóa thông báo');
		}
	};

	const formatTimeAgo = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMins / 60);
		const diffDays = Math.floor(diffHours / 24);

		if (diffMins < 1) return 'Vừa xong';
		if (diffMins < 60) return `${diffMins} phút trước`;
		if (diffHours < 24) return `${diffHours} giờ trước`;
		if (diffDays < 7) return `${diffDays} ngày trước`;
		return date.toLocaleDateString('vi-VN');
	};

	useEffect(() => {
		loadNotifications(1, true);
	}, [loadNotifications]);

	const unreadCount = notifications.filter((n) => !n.isRead).length;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Thông báo</h1>
					<p className="text-muted-foreground">
						Theo dõi cập nhật về đơn hàng và dịch vụ của bạn
					</p>
				</div>
				<div className="flex items-center gap-2">
					{unreadCount > 0 && (
						<Badge variant="secondary" className="gap-1">
							<Bell className="h-3 w-3" />
							{unreadCount} chưa đọc
						</Badge>
					)}
				</div>
			</div>

			{/* Filter and Actions */}
			<Card>
				<CardHeader className="pb-3">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex gap-2">
							<Button
								variant={filter === 'all' ? 'default' : 'outline'}
								size="sm"
								onClick={() => setFilter('all')}
							>
								Tất cả
							</Button>
							<Button
								variant={filter === 'unread' ? 'default' : 'outline'}
								size="sm"
								onClick={() => setFilter('unread')}
							>
								Chưa đọc
							</Button>
						</div>
						{unreadCount > 0 && (
							<Button
								variant="outline"
								size="sm"
								onClick={markAllAsRead}
								className="gap-2"
							>
								<CheckCheck className="h-4 w-4" />
								Đánh dấu tất cả đã đọc
							</Button>
						)}
					</div>
				</CardHeader>
			</Card>

			{/* Notifications List */}
			{loading ? (
				<div className="space-y-4">
					{Array.from({ length: 5 }).map((_, i) => (
						<Card key={i}>
							<CardContent className="p-4">
								<div className="flex items-start gap-3">
									<Skeleton className="h-10 w-10 rounded-full" />
									<div className="flex-1 space-y-2">
										<Skeleton className="h-4 w-3/4" />
										<Skeleton className="h-3 w-1/2" />
									</div>
									<Skeleton className="h-6 w-6" />
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			) : notifications.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<Bell className="h-12 w-12 text-muted-foreground mb-4" />
						<h3 className="text-lg font-medium mb-2">
							{filter === 'unread'
								? 'Không có thông báo chưa đọc'
								: 'Chưa có thông báo nào'}
						</h3>
						<p className="text-muted-foreground text-center">
							{filter === 'unread'
								? 'Tất cả thông báo của bạn đã được đọc.'
								: 'Chúng tôi sẽ thông báo cho bạn về các cập nhật quan trọng.'}
						</p>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-3">
					{notifications.map((notification, index) => (
						<Card
							key={notification.id}
							className={!notification.isRead ? 'border-primary/20' : ''}
						>
							<CardContent className="p-4">
								<div className="flex items-start gap-3">
									<div
										className={`p-2 rounded-full ${!notification.isRead ? 'bg-primary/10' : 'bg-muted'}`}
									>
										<Bell
											className={`h-4 w-4 ${!notification.isRead ? 'text-primary' : 'text-muted-foreground'}`}
										/>
									</div>
									<div className="flex-1 min-w-0">
										<p
											className={`text-sm ${!notification.isRead ? 'font-medium' : 'text-muted-foreground'}`}
										>
											{notification.message}
										</p>
										<p className="text-xs text-muted-foreground mt-1">
											{formatTimeAgo(notification.createdAt)}
										</p>
									</div>
									<div className="flex items-center gap-1">
										{!notification.isRead && (
											<div className="h-2 w-2 bg-primary rounded-full" />
										)}
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="icon" className="h-8 w-8">
													<MoreVertical className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												{!notification.isRead && (
													<DropdownMenuItem
														onClick={() => markAsRead(notification.id)}
													>
														<Check className="h-4 w-4 mr-2" />
														Đánh dấu đã đọc
													</DropdownMenuItem>
												)}
												<DropdownMenuItem
													onClick={() => deleteNotification(notification.id)}
													className="text-destructive"
												>
													<Trash2 className="h-4 w-4 mr-2" />
													Xóa
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</div>
							</CardContent>
							{index < notifications.length - 1 && <Separator />}
						</Card>
					))}

					{/* Load More Button */}
					{pagination.hasNext && (
						<div className="flex justify-center pt-4">
							<Button
								variant="outline"
								onClick={() => loadNotifications(pagination.page + 1, false)}
								disabled={loadingMore}
							>
								{loadingMore ? 'Đang tải...' : 'Tải thêm'}
							</Button>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
