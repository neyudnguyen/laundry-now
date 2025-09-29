import { Clock, Mail, Phone } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

export default function MapSection() {
	return (
		<section id="contact" className="bg-muted/30 py-16 sm:py-24">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				{/* Section Header */}
				<div className="mx-auto max-w-2xl text-center">
					<h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
						Liên hệ
					</h2>
					<p className="mt-4 text-lg leading-8 text-muted-foreground">
						Mạng lưới cửa hàng đối tác phủ sóng toàn thành phố
					</p>
				</div>

				<div className="mx-auto mt-8">
					{/* Contact Info Card */}
					<div className="max-w-6xl mx-auto">
						<Card className="h-full">
							<CardContent className="space-y-6 pt-6">
								{/* Phone, Email, Hours in a row */}
								<div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
									{/* Phone */}
									<div className="flex flex-col items-center gap-3">
										<Phone className="h-5 w-5 text-primary mt-0.5" />
										<div className="text-center">
											<h4 className="font-semibold text-foreground">
												Hotline hỗ trợ
											</h4>
											<p className="text-muted-foreground">0943846727</p>
											<p className="text-sm text-muted-foreground">
												Hỗ trợ đặt hàng và giải đáp thắc mắc
											</p>
										</div>
									</div>

									{/* Email */}
									<div className="flex flex-col items-center gap-3">
										<Mail className="h-5 w-5 text-primary mt-0.5" />
										<div className="text-center">
											<h4 className="font-semibold text-foreground">Email</h4>
											<p className="text-muted-foreground">
												giacuinhanh@gmail.com
											</p>
											<p className="text-sm text-muted-foreground">
												Phản hồi khiếu nại và góp ý
											</p>
										</div>
									</div>

									{/* Hours */}
									<div className="flex flex-col items-center gap-3">
										<Clock className="h-5 w-5 text-primary mt-0.5" />
										<div className="text-center">
											<h4 className="font-semibold text-foreground">
												Thời gian hỗ trợ
											</h4>
											<div className="space-y-1 text-sm text-muted-foreground">
												<p>Thứ 2 - Chủ nhật: 6:00 - 22:00</p>
											</div>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</section>
	);
}
