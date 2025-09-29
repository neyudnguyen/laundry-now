'use client';

import { UserRole } from '@prisma/client';
import {
	BarChart3,
	Bell,
	FileText,
	Home,
	LogOut,
	MessageSquare,
	ShoppingBag,
	Store,
	User,
	Wrench,
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { RoleSwitcher } from '@/components/RoleSwitcher';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarRail,
	SidebarSeparator,
	SidebarTrigger,
} from '@/components/ui/sidebar';
import { useUnreadNotifications } from '@/hooks/use-unread-notifications';

const menuItems = [
	{
		title: 'Trang chủ',
		icon: Home,
		href: '/vendor/dashboard',
	},
	{
		title: 'Thông báo',
		icon: Bell,
		href: '/vendor/notifications',
	},
	{
		title: 'Thông tin cá nhân',
		icon: User,
		href: '/vendor/profile',
	},
	{
		title: 'Quản lý dịch vụ',
		icon: Wrench,
		href: '/vendor/services',
	},
	{
		title: 'Đơn hàng',
		icon: ShoppingBag,
		href: '/vendor/orders',
	},
	{
		title: 'Thống kê doanh thu',
		icon: BarChart3,
		href: '/vendor/revenue',
	},
	{
		title: 'Hóa đơn thanh toán',
		icon: FileText,
		href: '/vendor/bills',
	},
	{
		title: 'Quản lý khiếu nại',
		icon: MessageSquare,
		href: '/vendor/complaints',
	},
];

export default function VendorLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { data: session, status } = useSession();
	const { unreadCount } = useUnreadNotifications();
	const router = useRouter();
	const pathname = usePathname();

	// Redirect if not authenticated or not a vendor
	useEffect(() => {
		if (status === 'loading') return; // Still loading

		if (!session) {
			router.push('/login');
			return;
		}

		if (session.user.role !== UserRole.VENDOR) {
			// Redirect to appropriate dashboard based on role
			if (session.user.role === UserRole.CUSTOMER) {
				router.push('/customer/marketplace');
			} else {
				router.push('/login');
			}
			return;
		}
	}, [session, status, router]);

	const handleSignOut = async () => {
		await signOut({
			callbackUrl: '/',
			redirect: true,
		});
	};

	// Show loading while checking authentication
	if (status === 'loading') {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
					<p className="mt-2 text-sm text-muted-foreground">Đang tải...</p>
				</div>
			</div>
		);
	}

	// Don't render anything if not authenticated or wrong role
	if (!session || session.user.role !== UserRole.VENDOR) {
		return null;
	}

	// Get shop display name - for now use phone number until we add shop name to profile
	const shopDisplayName = session.user.phone || 'Cửa hàng';
	const shopInitials = shopDisplayName
		.split('')
		.slice(0, 2)
		.join('')
		.toUpperCase();

	return (
		<SidebarProvider>
			<Sidebar variant="inset">
				<SidebarHeader className="border-b py-4">
					<div className="flex items-center gap-3">
						<Avatar className="h-10 w-10">
							<AvatarImage src="" alt={shopDisplayName} />
							<AvatarFallback className="bg-purple-500 text-white">
								{shopInitials}
							</AvatarFallback>
						</Avatar>
						<div className="flex flex-col">
							<span className="text-sm font-medium">{shopDisplayName}</span>
							<span className="text-xs text-muted-foreground">
								Nhà cung cấp
							</span>
						</div>
					</div>
				</SidebarHeader>

				<SidebarContent>
					<SidebarGroup>
						<SidebarGroupLabel>Quản lý cửa hàng</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{menuItems.map((item) => (
									<SidebarMenuItem key={item.href}>
										<SidebarMenuButton
											asChild
											isActive={pathname === item.href}
										>
											<Link
												href={item.href}
												className="flex items-center gap-3"
											>
												<item.icon className="h-4 w-4" />
												<span className="flex-1">{item.title}</span>
												{item.href === '/vendor/notifications' &&
													unreadCount > 0 && (
														<Badge
															variant="destructive"
															className="ml-auto text-xs"
														>
															{unreadCount > 99 ? '99+' : unreadCount}
														</Badge>
													)}
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>

				<SidebarFooter className="border-t px-4 py-4">
					<div className="space-y-2">
						<RoleSwitcher />
						<Button
							variant="ghost"
							onClick={handleSignOut}
							className="w-full justify-start gap-3 text-left"
						>
							<LogOut className="h-4 w-4" />
							Đăng xuất
						</Button>
					</div>
				</SidebarFooter>

				<SidebarRail />
			</Sidebar>

			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
					<SidebarTrigger />
					<SidebarSeparator orientation="vertical" className="mr-2 h-4" />
					<div className="flex items-center gap-2">
						<Store className="h-5 w-5" />
						<h1 className="text-lg font-semibold">
							{menuItems.find((item) => item.href === pathname)?.title ||
								'Dashboard Nhà cung cấp'}
						</h1>
					</div>
				</header>

				<main className="flex-1 overflow-auto p-6">{children}</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
