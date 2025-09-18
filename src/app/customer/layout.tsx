'use client';

import { UserRole } from '@prisma/client';
import {
	Bell,
	History,
	Home,
	LogOut,
	Settings,
	ShoppingBag,
	User,
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

const menuItems = [
	{
		title: 'Trang chủ',
		icon: Home,
		href: '/customer/dashboard',
	},
	{
		title: 'Thông báo',
		icon: Bell,
		href: '/customer/notifications',
	},
	{
		title: 'Thông tin cá nhân',
		icon: User,
		href: '/customer/profile',
	},
	{
		title: 'Đơn hàng',
		icon: ShoppingBag,
		href: '/customer/orders',
	},
	{
		title: 'Lịch sử đơn hàng',
		icon: History,
		href: '/customer/order-history',
	},
];

export default function CustomerLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { data: session, status } = useSession();
	const router = useRouter();
	const pathname = usePathname();

	// Redirect if not authenticated or not a customer
	useEffect(() => {
		if (status === 'loading') return; // Still loading

		if (!session) {
			router.push('/login');
			return;
		}

		if (session.user.role !== UserRole.CUSTOMER) {
			// Redirect to appropriate dashboard based on role
			if (session.user.role === UserRole.VENDOR) {
				router.push('/vendor/dashboard');
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
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
					<p className="mt-2 text-sm text-gray-600">Đang tải...</p>
				</div>
			</div>
		);
	}

	// Don't render anything if not authenticated or wrong role
	if (!session || session.user.role !== UserRole.CUSTOMER) {
		return null;
	}

	// Get user display name - for now use phone number until we add name to profile
	const userDisplayName = session.user.phone || 'Khách hàng';
	const userInitials = userDisplayName
		.split('')
		.slice(0, 2)
		.join('')
		.toUpperCase();

	return (
		<SidebarProvider>
			<div className="flex h-screen w-full">
				<Sidebar variant="inset">
					<SidebarHeader className="border-b px-6 py-4">
						<div className="flex items-center gap-3">
							<Avatar className="h-10 w-10">
								<AvatarImage src="" alt={userDisplayName} />
								<AvatarFallback className="bg-primary text-primary-foreground">
									{userInitials}
								</AvatarFallback>
							</Avatar>
							<div className="flex flex-col">
								<span className="text-sm font-medium">{userDisplayName}</span>
								<span className="text-xs text-muted-foreground">
									Khách hàng
								</span>
							</div>
						</div>
					</SidebarHeader>

					<SidebarContent>
						<SidebarGroup>
							<SidebarGroupLabel>Menu</SidebarGroupLabel>
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
													<span>{item.title}</span>
												</Link>
											</SidebarMenuButton>
										</SidebarMenuItem>
									))}
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>

						<SidebarSeparator />

						<SidebarGroup>
							<SidebarGroupLabel>Cài đặt</SidebarGroupLabel>
							<SidebarGroupContent>
								<SidebarMenu>
									<SidebarMenuItem>
										<SidebarMenuButton asChild>
											<Link
												href="/customer/settings"
												className="flex items-center gap-3"
											>
												<Settings className="h-4 w-4" />
												<span>Cài đặt tài khoản</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>
					</SidebarContent>

					<SidebarFooter className="border-t px-4 py-4">
						<Button
							variant="ghost"
							onClick={handleSignOut}
							className="w-full justify-start gap-3 text-left"
						>
							<LogOut className="h-4 w-4" />
							Đăng xuất
						</Button>
					</SidebarFooter>

					<SidebarRail />
				</Sidebar>

				<SidebarInset>
					<header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
						<SidebarTrigger className="-ml-1" />
						<SidebarSeparator orientation="vertical" className="mr-2 h-4" />
						<div className="flex items-center gap-2">
							<h1 className="text-lg font-semibold">
								{menuItems.find((item) => item.href === pathname)?.title ||
									'Dashboard'}
							</h1>
						</div>
					</header>

					<main className="flex-1 overflow-auto p-6">{children}</main>
				</SidebarInset>
			</div>
		</SidebarProvider>
	);
}
