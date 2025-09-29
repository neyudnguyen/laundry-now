'use client';

import { Shield } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminPage() {
	const { data: session, status } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (status === 'loading') return; // Still loading

		if (!session) {
			// Not logged in, redirect to login
			router.push('/admin/login');
			return;
		}

		// Check if user is admin
		if (session.user?.role === 'ADMIN') {
			// Admin logged in, redirect to dashboard
			router.push('/admin/dashboard');
		} else {
			// Not an admin, redirect to login
			router.push('/admin/login');
		}
	}, [session, status, router]);

	// Show loading screen while checking authentication
	return (
		<div className="min-h-screen flex items-center justify-center bg-background">
			<div className="text-center space-y-4">
				<div className="flex justify-center">
					<div className="p-4 bg-primary/10 rounded-full">
						<Shield className="h-12 w-12 text-primary animate-pulse" />
					</div>
				</div>
				<div className="space-y-2">
					<h2 className="text-xl font-semibold">
						Đang kiểm tra quyền truy cập...
					</h2>
					<p className="text-sm text-muted-foreground">
						Vui lòng chờ trong giây lát
					</p>
				</div>
				<div className="flex justify-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
				</div>
			</div>
		</div>
	);
}
