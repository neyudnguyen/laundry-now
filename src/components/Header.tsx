'use client';

import { Menu } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { Separator } from '@/components/ui/separator';
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui/sheet';

const navigationItems = [
	{ name: 'Trang chủ', href: '#hero' },
	{ name: 'Giới thiệu', href: '#about' },
	{ name: 'Dịch vụ', href: '#services' },
	{ name: 'Đánh giá', href: '#testimonials' },
	{ name: 'Liên hệ', href: '#contact' },
];

export default function Header() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background backdrop-blur supports-[backdrop-filter]:bg-background/80">
			<div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
				{/* Logo and Navigation */}
				<div className="flex items-center space-x-8">
					<Link href="/" className="flex items-center space-x-2">
						<span className="text-2xl font-bold text-primary">Laundry Now</span>
					</Link>

					{/* Desktop Navigation */}
					<NavigationMenu className="hidden md:flex">
						<NavigationMenuList>
							{navigationItems.map((item) => (
								<NavigationMenuItem key={item.name}>
									<NavigationMenuLink asChild>
										<Link
											href={item.href}
											className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
										>
											{item.name}
										</Link>
									</NavigationMenuLink>
								</NavigationMenuItem>
							))}
						</NavigationMenuList>
					</NavigationMenu>
				</div>

				{/* Auth Buttons */}
				<div className="hidden md:flex items-center space-x-4">
					<Button variant="ghost" asChild>
						<Link href="/login">Đăng nhập</Link>
					</Button>
					<Button asChild>
						<Link href="/register">Đăng ký</Link>
					</Button>
				</div>

				{/* Mobile Navigation */}
				<Sheet open={isOpen} onOpenChange={setIsOpen}>
					<SheetTrigger asChild className="md:hidden">
						<Button variant="ghost" size="icon">
							<Menu className="h-6 w-6" />
							<span className="sr-only">Mở menu</span>
						</Button>
					</SheetTrigger>
					<SheetContent side="right" className="w-[300px] sm:w-[400px]">
						<SheetHeader>
							<SheetTitle className="text-left text-2xl font-bold text-primary">
								Laundry Now
							</SheetTitle>
						</SheetHeader>

						<div className="mt-8 flex flex-col space-y-8 px-2">
							{/* Auth Buttons - Mobile */}
							<div className="flex flex-col space-y-3">
								<Button className="w-full h-12 text-base" asChild>
									<Link href="/register" onClick={() => setIsOpen(false)}>
										Đăng ký
									</Link>
								</Button>
								<Button
									variant="outline"
									className="w-full h-12 text-base"
									asChild
								>
									<Link href="/login" onClick={() => setIsOpen(false)}>
										Đăng nhập
									</Link>
								</Button>
							</div>

							{/* Separator */}
							<Separator />

							{/* Navigation Items */}
							<nav className="flex flex-col space-y-2">
								{navigationItems.map((item) => (
									<Button
										key={item.name}
										variant="ghost"
										className="w-full justify-start h-12 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
										asChild
									>
										<Link href={item.href} onClick={() => setIsOpen(false)}>
											{item.name}
										</Link>
									</Button>
								))}
							</nav>
						</div>
					</SheetContent>
				</Sheet>
			</div>
		</header>
	);
}
