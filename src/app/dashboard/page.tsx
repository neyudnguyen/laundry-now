import { redirect } from 'next/navigation';

import { LogoutButton } from '@/components/logout-button';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { auth } from '@/lib/auth';

export default async function DashboardPage() {
	const session = await auth();

	if (!session || !session.user) {
		redirect('/login');
	}

	// Double-check that the user is a customer
	if (session.user.role !== 'CUSTOMER') {
		redirect('/login');
	}

	return (
		<div className="min-h-screen p-4">
			<div className="mx-auto max-w-4xl space-y-6">
				<header className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold">Customer Dashboard</h1>
						<p className="text-muted-foreground">
							Welcome to your laundry service dashboard
						</p>
					</div>
					<LogoutButton />
				</header>

				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					<Card>
						<CardHeader>
							<CardTitle>Profile Information</CardTitle>
							<CardDescription>Your account details</CardDescription>
						</CardHeader>
						<CardContent className="space-y-2">
							<div>
								<p className="text-sm font-medium">Phone Number</p>
								<p className="text-sm text-muted-foreground">
									{session.user.phone}
								</p>
							</div>
							{session.user.email && (
								<div>
									<p className="text-sm font-medium">Email</p>
									<p className="text-sm text-muted-foreground">
										{session.user.email}
									</p>
								</div>
							)}
							<div>
								<p className="text-sm font-medium">Role</p>
								<p className="text-sm text-muted-foreground capitalize">
									{session.user.role}
								</p>
							</div>
							<div>
								<p className="text-sm font-medium">User ID</p>
								<p className="text-sm text-muted-foreground font-mono">
									{session.user.id}
								</p>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Recent Orders</CardTitle>
							<CardDescription>Your latest laundry orders</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">
								No orders yet. Start by placing your first order!
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Quick Actions</CardTitle>
							<CardDescription>Common tasks and shortcuts</CardDescription>
						</CardHeader>
						<CardContent className="space-y-2">
							<Button className="w-full" disabled>
								Place New Order
							</Button>
							<Button variant="outline" className="w-full" disabled>
								View Order History
							</Button>
							<Button variant="outline" className="w-full" disabled>
								Update Profile
							</Button>
						</CardContent>
					</Card>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Session Information</CardTitle>
						<CardDescription>
							Current authentication session details
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<p className="text-sm">
								<span className="font-medium">Logged in as:</span>{' '}
								{session.user.phone}
							</p>
							<p className="text-sm">
								<span className="font-medium">Session ID:</span>{' '}
								<span className="font-mono text-xs">{session.user.id}</span>
							</p>
							<p className="text-sm">
								<span className="font-medium">Authentication:</span> Active
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
