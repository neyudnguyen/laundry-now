import {
	Facebook,
	Instagram,
	Mail,
	MapPin,
	Phone,
	Twitter,
} from 'lucide-react';
import Link from 'next/link';

import { Separator } from '@/components/ui/separator';

const footerLinks = {
	helpAdvice: {
		title: 'Hỗ trợ & Tư vấn',
		links: [
			{ name: 'Hướng dẫn sử dụng', href: '#' },
			{
				name: 'Điều khoản dịch vụ',
				href: 'https://bbsthlwqbrwfaxmwxieh.supabase.co/storage/v1/object/public/images/docs/DIEU%20KHOAN%20&%20CHINH%20SACH%20DICH%20VU.docx',
				download: true,
			},
			{
				name: 'Chính sách bảo mật',
				href: 'https://bbsthlwqbrwfaxmwxieh.supabase.co/storage/v1/object/public/images/docs/DIEU%20KHOAN%20&%20CHINH%20SACH%20DICH%20VU.docx',
				download: true,
			},
			{ name: 'Giới thiệu', href: '#' },
			{ name: 'Câu hỏi thường gặp', href: '#' },
		],
	},
	getInTouch: {
		title: 'Liên hệ',
		links: [
			{ name: 'Hotline: 0943846727', href: 'tel:0943846727', icon: Phone },
			{
				name: 'giacuinhanh@gmail.com',
				href: 'mailto:giacuinhanh@gmail.com',
				icon: Mail,
			},
			{ name: 'Đại học FPT Quy Nhơn', href: '#', icon: MapPin },
		],
	},
};

const socialLinks = [
	{ name: 'Facebook', href: '#', icon: Facebook },
	{ name: 'Instagram', href: '#', icon: Instagram },
	{ name: 'Twitter', href: '#', icon: Twitter },
];

export default function Footer() {
	return (
		<footer className="border-t bg-background">
			<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
					{/* Company Info */}
					<div className="lg:col-span-1">
						<h3 className="text-2xl font-bold text-primary">Giặt ủi nhanh</h3>
						<p className="mt-4 text-sm text-muted-foreground">
							Dịch vụ giặt ủi thông minh, nhanh chóng và tiện lợi. Mang đến trải
							nghiệm tuyệt vời cho khách hàng với chất lượng đảm bảo và giá cả
							hợp lý.
						</p>

						{/* Social Links */}
						<div className="mt-6">
							<h4 className="text-sm font-semibold text-foreground">
								Theo dõi chúng tôi
							</h4>
							<div className="mt-3 flex space-x-3">
								{socialLinks.map((item) => {
									const Icon = item.icon;
									return (
										<Link
											key={item.name}
											href={item.href}
											className="text-muted-foreground hover:text-primary transition-colors"
										>
											<span className="sr-only">{item.name}</span>
											<Icon className="h-5 w-5" />
										</Link>
									);
								})}
							</div>
						</div>
					</div>

					{/* Help & Advice */}
					<div>
						<h4 className="text-sm font-semibold text-foreground">
							{footerLinks.helpAdvice.title}
						</h4>
						<ul className="mt-4 space-y-3">
							{footerLinks.helpAdvice.links.map((link) => (
								<li key={link.name}>
									<Link
										href={link.href}
										{...(link.download && { download: true, target: '_blank' })}
										className="text-sm text-muted-foreground hover:text-foreground transition-colors"
									>
										{link.name}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Get in Touch */}
					<div>
						<h4 className="text-sm font-semibold text-foreground">
							{footerLinks.getInTouch.title}
						</h4>
						<ul className="mt-4 space-y-3">
							{footerLinks.getInTouch.links.map((link) => {
								const Icon = link.icon;
								return (
									<li key={link.name}>
										<Link
											href={link.href}
											className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
										>
											<Icon className="h-4 w-4" />
											{link.name}
										</Link>
									</li>
								);
							})}
						</ul>

						{/* Operating Hours */}
						<div className="mt-6">
							<h5 className="text-sm font-medium text-foreground">
								Giờ hoạt động
							</h5>
							<p className="mt-1 text-sm text-muted-foreground">
								T2-T6: 6:00 - 22:00
							</p>
							<p className="text-sm text-muted-foreground">
								T7-CN: 7:00 - 21:00
							</p>
						</div>
					</div>
				</div>

				<Separator className="my-8" />

				{/* Bottom Section */}
				<div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
					<p className="text-sm text-muted-foreground">
						© {new Date().getFullYear()} Giặt ủi nhanh. Tất cả quyền được bảo
						lưu.
					</p>

					{/* Trust Badges */}
					<div className="flex items-center gap-4 text-xs text-muted-foreground">
						<div className="flex items-center gap-1">
							<div className="h-2 w-2 rounded-full bg-green-500" />
							<span>Chứng nhận ISO 9001</span>
						</div>
						<div className="flex items-center gap-1">
							<div className="h-2 w-2 rounded-full bg-blue-500" />
							<span>Thanh toán bảo mật</span>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}
