'use client';

import { Check, Crown, Star, Zap } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Types
interface PremiumPackage {
	id: string;
	name: string;
	type: string;
	price: number;
	duration: number;
	description: string | null;
	features: string[];
	popular: boolean;
}

interface CurrentPremium {
	id: string;
	status: string;
	startDate: string;
	endDate: string;
	package: {
		id: string;
		name: string;
		type: string;
		price: number;
		duration: number;
	};
}

export default function VendorDashboard() {
	const { data: session } = useSession();
	const [premiumPackages, setPremiumPackages] = useState<PremiumPackage[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [vendorId, setVendorId] = useState<string | null>(null);
	const [isPremium, setIsPremium] = useState(false);
	const [currentPremium, setCurrentPremium] = useState<CurrentPremium | null>(
		null,
	);

	// Fetch vendor profile và premium packages
	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);

				// Fetch vendor profile để lấy vendorId và trạng thái premium
				const vendorResponse = await fetch('/api/vendor/profile');
				if (vendorResponse.ok) {
					const vendorData = await vendorResponse.json();
					const vendorProfile = vendorData?.user?.vendorProfile;

					if (vendorProfile?.id) {
						setVendorId(vendorProfile.id);
						setIsPremium(vendorProfile.isPremium || false);

						// Nếu vendor đã có premium, lấy thông tin gói premium hiện tại
						if (vendorProfile.isPremium) {
							const premiumResponse = await fetch(
								`/api/vendor/premium/${vendorProfile.id}`,
							);
							if (premiumResponse.ok) {
								const premiumData = await premiumResponse.json();
								setCurrentPremium(premiumData.currentPremium);
							}
						}
					} else {
						setError('Không tìm thấy thông tin vendor profile');
						return;
					}
				} else {
					setError('Không thể tải thông tin vendor');
					return;
				}

				// Fetch premium packages
				const packagesResponse = await fetch('/api/premium-packages');
				const packagesResult = await packagesResponse.json();

				if (packagesResult.success) {
					setPremiumPackages(packagesResult.data);
				} else {
					setError(packagesResult.error || 'Failed to fetch premium packages');
				}
			} catch (err) {
				console.error('Error fetching data:', err);
				setError('Failed to fetch data');
			} finally {
				setLoading(false);
			}
		};

		if (session?.user?.id) {
			fetchData();
		}
	}, [session?.user?.id]);

	// Xử lý payment result từ PayOS redirect
	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const payment = urlParams.get('payment');
		const type = urlParams.get('type');

		if (payment && type === 'premium') {
			if (payment === 'success') {
				// Thanh toán thành công
				alert(
					'Thanh toán gói Premium thành công! Cửa hàng của bạn đã được nâng cấp.',
				);
				// Clear URL params
				window.history.replaceState(
					{},
					document.title,
					window.location.pathname,
				);
			} else if (payment === 'cancel') {
				// Thanh toán bị hủy
				alert('Thanh toán đã bị hủy. Bạn có thể thử lại bất cứ lúc nào.');
				// Clear URL params
				window.history.replaceState(
					{},
					document.title,
					window.location.pathname,
				);
			}
		}
	}, []);

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND',
		}).format(amount);
	};

	const handleSelectPackage = async (packageId: string) => {
		try {
			if (!vendorId) {
				setError('Không tìm thấy thông tin vendor');
				return;
			}

			setLoading(true);
			setError(null);

			const requestBody = {
				vendorId,
				packageId,
			};

			console.log('Sending purchase request:', requestBody);

			const response = await fetch('/api/premium-packages/purchase', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(requestBody),
			});

			const result = await response.json();

			if (result.success) {
				// Redirect đến PayOS payment
				window.location.href = result.data.paymentLink;
			} else {
				setError(result.error || 'Có lỗi xảy ra khi tạo đơn thanh toán');
			}
		} catch (err) {
			console.error('Error selecting package:', err);
			setError('Có lỗi xảy ra khi tạo đơn thanh toán');
		} finally {
			setLoading(false);
		}
	};

	// Loading state
	if (loading) {
		return (
			<div className="container mx-auto px-4 py-4">
				<div className="flex items-center justify-center min-h-[400px]">
					<div className="text-center space-y-2">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
						<p className="text-sm text-muted-foreground">
							Đang tải gói Premium...
						</p>
					</div>
				</div>
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className="container mx-auto px-4 py-4">
				<div className="flex items-center justify-center min-h-[400px]">
					<div className="text-center space-y-2">
						<p className="text-sm text-destructive">{error}</p>
						<Button variant="outline" onClick={() => window.location.reload()}>
							Thử lại
						</Button>
					</div>
				</div>
			</div>
		);
	}

	// Nếu vendor đã có premium, hiển thị dashboard premium
	if (isPremium && currentPremium) {
		return (
			<div className="container mx-auto px-4 py-4 space-y-5">
				{/* Premium Status Header */}
				<Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
					<CardHeader className="text-center space-y-3">
						<div className="flex justify-center">
							<Crown className="h-12 w-12 text-primary" />
						</div>
						<div className="space-y-2">
							<h1 className="text-2xl font-bold text-primary">
								🎉 Chúc mừng! Bạn đã là Vendor Premium
							</h1>
							<p className="text-sm text-muted-foreground">
								Cửa hàng của bạn được ưu tiên hiển thị và nhận được nhiều lợi
								ích đặc biệt
							</p>
						</div>
					</CardHeader>
				</Card>

				{/* Current Premium Package Info */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Star className="h-5 w-5 text-primary" />
							Gói Premium hiện tại
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<p className="text-sm text-muted-foreground">Tên gói</p>
								<p className="font-semibold">{currentPremium.package.name}</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Trạng thái</p>
								<Badge
									variant="secondary"
									className="bg-green-100 text-green-800"
								>
									Đang hoạt động
								</Badge>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Ngày bắt đầu</p>
								<p className="font-medium">
									{new Date(currentPremium.startDate).toLocaleDateString(
										'vi-VN',
									)}
								</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Ngày hết hạn</p>
								<p className="font-medium">
									{new Date(currentPremium.endDate).toLocaleDateString('vi-VN')}
								</p>
							</div>
						</div>

						{/* Premium Benefits */}
						<div className="pt-4 border-t">
							<h4 className="font-medium mb-3">Lợi ích bạn đang nhận được:</h4>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
								<div className="flex items-center gap-2">
									<Check className="h-4 w-4 text-green-600" />
									<span className="text-sm">Ưu tiên hiển thị trong top 10</span>
								</div>
								<div className="flex items-center gap-2">
									<Check className="h-4 w-4 text-green-600" />
									<span className="text-sm">
										Tăng khả năng tiếp cận khách hàng
									</span>
								</div>
								<div className="flex items-center gap-2">
									<Check className="h-4 w-4 text-green-600" />
									<span className="text-sm">Hỗ trợ khách hàng ưu tiên</span>
								</div>
								<div className="flex items-center gap-2">
									<Check className="h-4 w-4 text-green-600" />
									<span className="text-sm">Báo cáo doanh thu chi tiết</span>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Renewal Options */}
				<Card>
					<CardHeader>
						<CardTitle>Gia hạn Premium</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground mb-4">
							Gói Premium hiện tại sẽ hết hạn vào ngày{' '}
							{new Date(currentPremium.endDate).toLocaleDateString('vi-VN')}.
							Gia hạn ngay để không bị gián đoạn dịch vụ!
						</p>
						<Button variant="outline" className="w-full">
							<Crown className="h-4 w-4 mr-2" />
							Gia hạn Premium
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Nếu vendor chưa có premium, hiển thị gói để mua
	return (
		<div className="container mx-auto px-4 py-4 space-y-5">
			{/* Header Section */}
			<div className="text-center space-y-2">
				<div className="flex justify-center">
					<Crown className="h-8 w-8 text-primary" />
				</div>
				<h1 className="text-2xl md:text-3xl font-bold">Nâng cấp lên Premium</h1>
				<p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
					Gia tăng doanh thu và tiếp cận nhiều khách hàng hơn
				</p>
			</div>

			{/* Premium Packages Grid */}
			{premiumPackages.length === 0 ? (
				<div className="text-center py-8">
					<p className="text-muted-foreground">
						Không có gói Premium nào khả dụng
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-4xl mx-auto">
					{premiumPackages.map((pkg) => (
						<Card
							key={pkg.id}
							className={`relative overflow-hidden transition-all duration-300 hover:shadow-md ${
								pkg.popular ? 'ring-2 ring-primary' : ''
							}`}
						>
							{pkg.popular && (
								<div className="absolute top-0 right-0 bg-primary text-primary-foreground px-2 py-1 text-xs font-medium">
									<Star className="inline h-3 w-3 mr-1" />
									Phổ biến
								</div>
							)}

							<CardHeader className="text-center space-y-3 pb-4">
								<div className="flex justify-center">
									{pkg.type === 'MONTHLY' ? (
										<Zap className="h-6 w-6 text-primary" />
									) : (
										<Crown className="h-6 w-6 text-primary" />
									)}
								</div>
								<CardTitle className="text-lg">{pkg.name}</CardTitle>
								<div className="space-y-1">
									<div className="text-2xl font-bold">
										{formatCurrency(pkg.price)}
									</div>
									<p className="text-xs text-muted-foreground">
										{pkg.type === 'MONTHLY' ? 'mỗi tháng' : 'mỗi năm'}
									</p>
									{pkg.type === 'YEARLY' && (
										<Badge variant="secondary" className="text-xs">
											Tiết kiệm 40%
										</Badge>
									)}
								</div>
							</CardHeader>

							<CardContent className="space-y-4 pt-0">
								{/* Features List */}
								<div className="space-y-2">
									<h4 className="font-medium text-xs uppercase tracking-wide text-muted-foreground">
										Tính năng:
									</h4>
									<ul className="space-y-2">
										{pkg.features.slice(0, 4).map((feature, index) => (
											<li key={index} className="flex items-start gap-2">
												<Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
												<span className="text-xs leading-relaxed">
													{feature}
												</span>
											</li>
										))}
										{pkg.features.length > 4 && (
											<li className="text-xs text-muted-foreground ml-6">
												+{pkg.features.length - 4} tính năng khác
											</li>
										)}
									</ul>
								</div>

								{/* Action Button */}
								<Button
									className="w-full h-10 text-sm font-medium"
									variant={pkg.popular ? 'default' : 'outline'}
									disabled={loading}
									onClick={() => handleSelectPackage(pkg.id)}
								>
									{pkg.popular ? (
										<>
											<Crown className="h-4 w-4 mr-2" />
											Chọn gói Premium
										</>
									) : (
										<>
											<Zap className="h-4 w-4 mr-2" />
											Chọn gói này
										</>
									)}
								</Button>

								{/* Additional Info */}
								<div className="text-center text-xs text-muted-foreground">
									<p>{pkg.duration} ngày • PayOS</p>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{/* Benefits Section */}
			<Card className="bg-muted/30">
				<CardHeader className="text-center pb-3">
					<CardTitle className="text-lg">Tại sao nên chọn Premium?</CardTitle>
				</CardHeader>
				<CardContent className="pt-0">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="text-center space-y-2">
							<div className="bg-primary/10 rounded-full p-2 w-8 h-8 mx-auto flex items-center justify-center">
								<Star className="h-4 w-4 text-primary" />
							</div>
							<h4 className="font-medium text-sm">Ưu tiên hiển thị</h4>
							<p className="text-xs text-muted-foreground">
								Top 10 đầu tiên khi khách tìm kiếm
							</p>
						</div>
						<div className="text-center space-y-2">
							<div className="bg-primary/10 rounded-full p-2 w-8 h-8 mx-auto flex items-center justify-center">
								<Zap className="h-4 w-4 text-primary" />
							</div>
							<h4 className="font-medium text-sm">Tăng doanh thu</h4>
							<p className="text-xs text-muted-foreground">
								Tiếp cận nhiều khách hàng hơn
							</p>
						</div>
						<div className="text-center space-y-2">
							<div className="bg-primary/10 rounded-full p-2 w-8 h-8 mx-auto flex items-center justify-center">
								<Crown className="h-4 w-4 text-primary" />
							</div>
							<h4 className="font-medium text-sm">Hỗ trợ đặc biệt</h4>
							<p className="text-xs text-muted-foreground">
								Hỗ trợ ưu tiên và marketing nâng cao
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* FAQ Section */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-lg">Câu hỏi thường gặp</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3 pt-0">
					<div className="space-y-1">
						<h4 className="font-medium text-sm">
							Tôi có thể hủy gói Premium không?
						</h4>
						<p className="text-xs text-muted-foreground">
							Bạn có thể hủy bất cứ lúc nào, gói vẫn có hiệu lực đến hết thời
							hạn đã thanh toán.
						</p>
					</div>
					<div className="space-y-1">
						<h4 className="font-medium text-sm">Thanh toán như thế nào?</h4>
						<p className="text-xs text-muted-foreground">
							Thanh toán an toàn qua PayOS: thẻ ngân hàng, ví điện tử, QR Code.
						</p>
					</div>
					<div className="space-y-1">
						<h4 className="font-medium text-sm">Khi nào tôi thấy hiệu quả?</h4>
						<p className="text-xs text-muted-foreground">
							Ngay sau khi thanh toán, cửa hàng được ưu tiên hiển thị và tăng
							lượng khách.
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
