export default function AdminRootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// Root layout chỉ render children, không có authentication check
	// Authentication được xử lý bởi middleware
	return <>{children}</>;
}
