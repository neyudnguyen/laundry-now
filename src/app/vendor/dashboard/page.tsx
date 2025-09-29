'use client';

import { Check, Crown, Star, Zap } from 'lucide-react';
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

export default function VendorDashboard() {
	const [premiumPackages, setPremiumPackages] = useState<PremiumPackage[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Fetch premium packages từ API
	useEffect(() => {
		const fetchPremiumPackages = async () => {
			try {
				setLoading(true);
				const response = await fetch('/api/premium-packages');
				const result = await response.json();

				if (result.success) {
					setPremiumPackages(result.data);
				} else {
					setError(result.error || 'Failed to fetch premium packages');
				}
			} catch (err) {
				console.error('Error fetching premium packages:', err);
				setError('Failed to fetch premium packages');
			} finally {
				setLoading(false);
			}
		};

		fetchPremiumPackages();
	}, []);

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
			setLoading(true);
			setError(null);

			// TODO: Lấy vendorId từ session/auth context
			// Tạm thời hardcode để test
			const vendorId = 'vendor_id_from_session';

			const response = await fetch('/api/premium-packages/purchase', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					vendorId,
					packageId,
				}),
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
