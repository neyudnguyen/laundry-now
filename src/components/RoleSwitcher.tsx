'use client';

import { UserRole } from '@prisma/client';
import { RefreshCw, Store, User } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface RoleSwitcherProps {
	className?: string;
}

export function RoleSwitcher({ className }: RoleSwitcherProps) {
	const { data: session } = useSession();
	const { toast } = useToast();
	const [isLoading, setIsLoading] = useState(false);
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	if (!session?.user) return null;

	const currentRole = session.user.role;
	const targetRole =
		currentRole === UserRole.CUSTOMER ? UserRole.VENDOR : UserRole.CUSTOMER;
	const targetRoleText =
		targetRole === UserRole.CUSTOMER ? 'Khách hàng' : 'Nhà cung cấp';
	const targetIcon = targetRole === UserRole.CUSTOMER ? User : Store;
	const TargetIcon = targetIcon;

	const handleRoleSwitch = async () => {
		setIsLoading(true);
		try {
			const response = await fetch('/api/user/switch-role', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					targetRole,
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Có lỗi xảy ra');
			}

			// Success - sign out and redirect to login
			toast.success('Chuyển đổi thành công!');

			// Sign out and redirect to login
			await signOut({
				callbackUrl: '/login',
				redirect: true,
			});
		} catch (error) {
			console.error('Error switching role:', error);
			toast.error('Lỗi', {
				description:
					error instanceof Error ? error.message : 'Không thể chuyển đổi role',
			});
		} finally {
			setIsLoading(false);
			setIsDialogOpen(false);
		}
	};

	return (
		<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
			<DialogTrigger asChild>
				<Button
					variant="ghost"
					className={`w-full justify-start gap-3 text-left ${className}`}
				>
					<RefreshCw className="h-4 w-4" />
					Trở thành {targetRoleText}
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<TargetIcon className="h-5 w-5" />
						Chuyển đổi role
					</DialogTitle>
					<DialogDescription>
						Bạn có chắc chắn muốn chuyển từ{' '}
						<span className="font-medium">
							{currentRole === UserRole.CUSTOMER
								? 'Khách hàng'
								: 'Nhà cung cấp'}
						</span>{' '}
						sang <span className="font-medium">{targetRoleText}</span>?
						<br />
						<br />
						Bạn sẽ cần đăng nhập lại sau khi chuyển đổi.
					</DialogDescription>
				</DialogHeader>
				<div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
					<Button
						variant="outline"
						onClick={() => setIsDialogOpen(false)}
						disabled={isLoading}
					>
						Hủy
					</Button>
					<Button onClick={handleRoleSwitch} disabled={isLoading}>
						{isLoading ? (
							<>
								<RefreshCw className="mr-2 h-4 w-4 animate-spin" />
								Đang chuyển đổi...
							</>
						) : (
							<>
								<TargetIcon className="mr-2 h-4 w-4" />
								Trở thành {targetRoleText}
							</>
						)}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
