'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Separator } from '@/components/ui/separator';
import { VendorAddressManager } from '@/components/vendor/VendorAddressManager';
import { VendorBasicInfo } from '@/components/vendor/VendorBasicInfo';
import { VendorImageManager } from '@/components/vendor/VendorImageManager';
import { useToast } from '@/hooks/use-toast';

interface VendorData {
	user: {
		id: string;
		phone: string;
		email?: string;
		vendorProfile?: {
			id: string;
			shopName: string;
			address?: {
				id: string;
				province: string;
				district: string;
				ward: string;
				street: string;
			};
			images: Array<{
				id: string;
				url: string;
			}>;
		};
	};
}

const VendorProfilePage = () => {
	const { data: session, status } = useSession();
	const [vendorData, setVendorData] = useState<VendorData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const { toast } = useToast();

	// Redirect if not authenticated or not a vendor
	useEffect(() => {
		if (status === 'loading') return;

		if (!session || session.user.role !== 'VENDOR') {
			redirect('/login');
		}
	}, [session, status]);

	// Fetch vendor data
	const fetchVendorData = async () => {
		try {
			const response = await fetch('/api/vendor/profile');
			if (response.ok) {
				const data = await response.json();
				setVendorData(data);
			} else {
				toast.error('Không thể tải thông tin profile');
			}
		} catch (error) {
			console.error('Error fetching vendor data:', error);
			toast.error('Có lỗi xảy ra khi tải thông tin');
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (session?.user?.id) {
			fetchVendorData();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [session?.user?.id]);

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
						<div className="h-64 bg-muted animate-pulse rounded-lg" />
					</div>
				</div>
			</div>
		);
	}

	const handleProfileUpdate = () => {
		fetchVendorData(); // Refresh data after update
	};

	return (
		<div className="container mx-auto py-8">
			<div className="max-w-6xl mx-auto space-y-8">
				{/* Header */}
				<div className="mb-8">
					<div className="flex items-center space-x-4 mb-4">
						<div className="h-16 w-16 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold">
							{vendorData?.user?.vendorProfile?.shopName
								?.charAt(0)
								?.toUpperCase() ||
								vendorData?.user?.phone?.charAt(0) ||
								'S'}
						</div>
						<div>
							<h1 className="text-3xl font-bold tracking-tight">
								{vendorData?.user?.vendorProfile?.shopName ||
									'Cửa hàng của tôi'}
							</h1>
							<p className="text-muted-foreground">
								Quản lý thông tin cửa hàng
							</p>
						</div>
					</div>
					<Separator />
				</div>

				{/* Content Layout - 3 sections */}
				<div className="space-y-8">
					{/* Thông tin cơ bản */}
					<section>
						<VendorBasicInfo
							initialData={{
								shopName: vendorData?.user?.vendorProfile?.shopName || '',
								phone: vendorData?.user?.phone || '',
								email: vendorData?.user?.email || '',
							}}
							onSuccess={handleProfileUpdate}
						/>
					</section>

					{/* Địa chỉ cửa hàng */}
					<section>
						<VendorAddressManager
							vendorAddress={vendorData?.user?.vendorProfile?.address || null}
							onSuccess={handleProfileUpdate}
						/>
					</section>

					{/* Ảnh cửa hàng */}
					<section>
						<VendorImageManager
							vendorImages={vendorData?.user?.vendorProfile?.images || []}
							onSuccess={handleProfileUpdate}
						/>
					</section>
				</div>
			</div>
		</div>
	);
};

export default VendorProfilePage;
