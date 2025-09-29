'use client';

import {
	AlertTriangle,
	DollarSign,
	FileText,
	LayoutDashboard,
	LogOut,
	Shield,
	Store,
	Users,
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
		title: 'Dashboard',
		icon: LayoutDashboard,
		href: '/admin/dashboard',
	},
	{
		title: 'Khách hàng',
		icon: Users,
		href: '/admin/customers',
	},
	{
		title: 'Nhà cung cấp',
		icon: Store,
		href: '/admin/vendors',
	},
	{
		title: 'Hóa đơn',
		icon: FileText,
		href: '/admin/bills',
	},
	{
		title: 'Doanh thu',
		icon: DollarSign,
		href: '/admin/revenue',
	},
	{
		title: 'Khiếu nại',
		icon: AlertTriangle,
		href: '/admin/complaints',
	},
];

export default function ProtectedAdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { data: session, status } = useSession();
	const router = useRouter();
	const pathname = usePathname();

	// Redirect if not authenticated or not an admin
	useEffect(() => {
		if (status === 'loading') return;

		if (!session) {
			router.push('/admin/login');
			return;
		}

		// Check if user is admin
		if (session.user?.role !== 'ADMIN') {
			router.push('/admin/login');
			return;
		}
	}, [session, status, router]);

	const handleSignOut = async () => {
		await signOut({
			callbackUrl: '/admin/login',
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
	if (!session || session.user?.role !== 'ADMIN') {
		return null;
	}

	// Get admin display name
	const adminDisplayName = session.user.name || session.user.email || 'Admin';
	const adminInitials = adminDisplayName
		.split(' ')
		.map((name) => name.charAt(0))
		.join('')
		.toUpperCase()
		.slice(0, 2);

	return (
		<SidebarProvider>
			<Sidebar variant="inset">
				<SidebarHeader className="border-b py-4">
					<div className="flex items-center gap-3">
						<Avatar className="h-10 w-10">
							<AvatarImage src="" alt={adminDisplayName} />
							<AvatarFallback className="bg-primary text-primary-foreground">
								{adminInitials}
							</AvatarFallback>
						</Avatar>
						<div className="flex flex-col">
							<span className="text-sm font-medium">{adminDisplayName}</span>
							<span className="text-xs text-muted-foreground">
								Quản trị viên
							</span>
						</div>
					</div>
				</SidebarHeader>

				<SidebarContent>
					<SidebarGroup>
						<SidebarGroupLabel>
							<div className="flex items-center gap-2">
								<Shield className="h-4 w-4" />
								Bảng điều khiển Admin
							</div>
						</SidebarGroupLabel>
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
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
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
					<SidebarTrigger />
					<SidebarSeparator orientation="vertical" className="mr-2 h-4" />
					<div className="flex items-center gap-2">
						<h1 className="text-lg font-semibold">
							{menuItems.find((item) => item.href === pathname)?.title ||
								'Admin Dashboard'}
						</h1>
					</div>
				</header>

				<main className="flex-1 overflow-auto p-6">{children}</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
