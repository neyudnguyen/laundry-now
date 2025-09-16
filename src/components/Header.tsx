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
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui/sheet';

const navigationItems = [
	{ name: 'Trang chủ', href: '/' },
	{ name: 'Giới thiệu', href: '/about' },
	{ name: 'Dịch vụ', href: '/services' },
	{ name: 'Đánh giá', href: '/reviews' },
	{ name: 'Trung tâm', href: '/centers' },
];

export default function Header() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
				{/* Logo */}
				<Link href="/" className="flex items-center space-x-2">
					<span className="text-2xl font-bold text-primary">Laundry Now</span>
				</Link>

				{/* Desktop Navigation */}
				<NavigationMenu className="hidden md:flex">
					<NavigationMenuList>
						{navigationItems.map((item) => (
							<NavigationMenuItem key={item.name}>
								<Link href={item.href} legacyBehavior passHref>
									<NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
										{item.name}
									</NavigationMenuLink>
								</Link>
							</NavigationMenuItem>
						))}
					</NavigationMenuList>
				</NavigationMenu>

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
							<SheetTitle className="text-left">Laundry Now</SheetTitle>
						</SheetHeader>
						<nav className="mt-6 flex flex-col space-y-4">
							{navigationItems.map((item) => (
								<Link
									key={item.name}
									href={item.href}
									className="text-lg font-medium transition-colors hover:text-primary"
									onClick={() => setIsOpen(false)}
								>
									{item.name}
								</Link>
							))}
						</nav>
					</SheetContent>
				</Sheet>
			</div>
		</header>
	);
}
