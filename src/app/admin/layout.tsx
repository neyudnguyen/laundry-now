'use client';

import {
	AlertTriangle,
	LayoutDashboard,
	LogOut,
	Menu,
	MessageSquare,
	Settings,
	Shield,
	Store,
	Users,
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface SidebarItem {
	title: string;
	icon: React.ComponentType<{ className?: string }>;
	href: string;
}

const sidebarItems: SidebarItem[] = [
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
		title: 'Khiếu nại',
		icon: AlertTriangle,
		href: '/admin/complaints',
	},
	{
		title: 'Tin nhắn',
		icon: MessageSquare,
		href: '/admin/messages',
	},
	{
		title: 'Cài đặt',
		icon: Settings,
		href: '/admin/settings',
	},
];

function SidebarContent() {
	const pathname = usePathname();

	return (
		<div className="flex h-full flex-col">
			<div className="flex items-center gap-2 border-b px-6 py-4">
				<Shield className="h-6 w-6 text-primary" />
				<span className="text-lg font-semibold">Admin Panel</span>
			</div>
			<nav className="flex-1 space-y-1 p-4">
				{sidebarItems.map((item) => {
					const Icon = item.icon;
					const isActive = pathname === item.href;

					return (
						<Link
							key={item.href}
							href={item.href}
							className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
								isActive
									? 'bg-accent text-accent-foreground'
									: 'text-muted-foreground'
							}`}
						>
							<Icon className="h-4 w-4" />
							{item.title}
						</Link>
					);
				})}
			</nav>
		</div>
	);
}

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { data: session, status } = useSession();
	const router = useRouter();
	const pathname = usePathname();

	// Redirect if not authenticated or not an admin
	useEffect(() => {
		if (status === 'loading') return; // Still loading

		if (!session) {
			if (pathname !== '/admin/login') {
				router.push('/admin/login');
			}
			return;
		}

		// Check if user is admin (you might need to adjust this based on your auth setup)
		if (session.user?.email && !session.user.email.includes('admin')) {
			// If not admin, redirect to login
			router.push('/admin/login');
			return;
		}
	}, [session, status, router, pathname]);

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
				<div className="flex items-center gap-2">
					<div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
					<span>Đang tải...</span>
				</div>
			</div>
		);
	}

	// Show login page if not authenticated
	if (!session && pathname !== '/admin/login') {
		return null; // Router will handle redirect
	}

	// Don't show layout for login page
	if (pathname === '/admin/login') {
		return <>{children}</>;
	}

	return (
		<div className="flex h-screen bg-background">
			{/* Desktop Sidebar */}
			<aside className="hidden w-64 border-r bg-card lg:block">
				<SidebarContent />
			</aside>

			{/* Main Content */}
			<div className="flex flex-1 flex-col overflow-hidden">
				{/* Header */}
				<header className="flex h-16 items-center justify-between border-b bg-card px-4 lg:px-6">
					<div className="flex items-center gap-4">
						{/* Mobile Menu */}
						<Sheet>
							<SheetTrigger asChild>
								<Button variant="ghost" size="icon" className="lg:hidden">
									<Menu className="h-5 w-5" />
									<span className="sr-only">Toggle menu</span>
								</Button>
							</SheetTrigger>
							<SheetContent side="left" className="w-64 p-0">
								<SidebarContent />
							</SheetContent>
						</Sheet>

						<h1 className="text-lg font-semibold lg:text-xl">
							Hệ thống quản lý
						</h1>
					</div>

					{/* User Menu */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="relative h-8 w-8 rounded-full">
								<Avatar className="h-8 w-8">
									<AvatarFallback>
										{session?.user?.email?.charAt(0).toUpperCase() || 'A'}
									</AvatarFallback>
								</Avatar>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-56" align="end" forceMount>
							<DropdownMenuLabel className="font-normal">
								<div className="flex flex-col space-y-1">
									<p className="text-sm font-medium leading-none">Admin</p>
									<p className="text-xs leading-none text-muted-foreground">
										{session?.user?.email}
									</p>
								</div>
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={handleSignOut}>
								<LogOut className="mr-2 h-4 w-4" />
								<span>Đăng xuất</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</header>

				{/* Page Content */}
				<main className="flex-1 overflow-y-auto p-4 lg:p-6">
					<div className="mx-auto max-w-7xl">{children}</div>
				</main>
			</div>
		</div>
	);
}
