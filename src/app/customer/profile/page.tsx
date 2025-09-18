'use client';

import { MapPin, Settings, User } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

import { CustomerAddressManager } from '@/components/customer/CustomerAddressManager';
import { CustomerBasicInfo } from '@/components/customer/CustomerBasicInfo';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface CustomerData {
	user: {
		id: string;
		phone: string;
		email?: string;
		profile?: {
			id: string;
			fullName: string;
		};
	};
}

const CustomerProfilePage = () => {
	const { data: session, status } = useSession();
	const [customerData, setCustomerData] = useState<CustomerData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const { toast } = useToast();

	// Redirect if not authenticated or not a customer
	useEffect(() => {
		if (status === 'loading') return;

		if (!session || session.user.role !== 'CUSTOMER') {
			redirect('/login');
		}
	}, [session, status]);

	// Fetch customer data
	const fetchCustomerData = async () => {
		try {
			const response = await fetch('/api/customer/profile');
			if (response.ok) {
				const data = await response.json();
				setCustomerData(data);
			} else {
				toast.error('Không thể tải thông tin profile');
			}
		} catch (error) {
			console.error('Error fetching customer data:', error);
			toast.error('Có lỗi xảy ra khi tải thông tin');
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (session?.user?.id) {
			fetchCustomerData();
		}
	}, [session]);

	if (status === 'loading' || isLoading) {
		return (
			<div className="container mx-auto py-8">
				<div className="max-w-4xl mx-auto">
					<div className="flex items-center space-x-4 mb-8">
						<div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
						<div className="space-y-2">
							<div className="h-4 w-48 bg-muted animate-pulse rounded" />
							<div className="h-3 w-32 bg-muted animate-pulse rounded" />
						</div>
					</div>
					<div className="space-y-4">
						<div className="h-64 bg-muted animate-pulse rounded-lg" />
						<div className="h-64 bg-muted animate-pulse rounded-lg" />
					</div>
				</div>
			</div>
		);
	}

	const handleProfileUpdate = () => {
		fetchCustomerData(); // Refresh data after update
	};

	return (
		<div className="container mx-auto py-8">
			<div className="max-w-4xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<div className="flex items-center space-x-4 mb-4">
						<div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
							{customerData?.user?.profile?.fullName
								?.charAt(0)
								?.toUpperCase() ||
								customerData?.user?.phone?.charAt(0) ||
								'U'}
						</div>
						<div>
							<h1 className="text-3xl font-bold tracking-tight">
								{customerData?.user?.profile?.fullName || 'Tài khoản của tôi'}
							</h1>
							<p className="text-muted-foreground">
								Quản lý thông tin cá nhân và cài đặt tài khoản
							</p>
						</div>
					</div>
					<Separator />
				</div>

				{/* Tabs Content */}
				<Tabs defaultValue="profile" className="space-y-6">
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="profile" className="flex items-center gap-2">
							<User className="h-4 w-4" />
							Thông tin cá nhân
						</TabsTrigger>
						<TabsTrigger value="addresses" className="flex items-center gap-2">
							<MapPin className="h-4 w-4" />
							Địa chỉ
						</TabsTrigger>
						<TabsTrigger value="settings" className="flex items-center gap-2">
							<Settings className="h-4 w-4" />
							Cài đặt
						</TabsTrigger>
					</TabsList>

					<TabsContent value="profile" className="space-y-6">
						<CustomerBasicInfo
							initialData={{
								fullName: customerData?.user?.profile?.fullName || '',
								phone: customerData?.user?.phone || '',
								email: customerData?.user?.email || '',
							}}
							onSuccess={handleProfileUpdate}
						/>
					</TabsContent>

					<TabsContent value="addresses" className="space-y-6">
						<CustomerAddressManager />
					</TabsContent>

					<TabsContent value="settings" className="space-y-6">
						<div className="text-center py-8 text-muted-foreground">
							<Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
							<p>Tính năng cài đặt sẽ được phát triển trong tương lai</p>
						</div>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
};

export default CustomerProfilePage;
