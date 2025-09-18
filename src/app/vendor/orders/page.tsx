export default function VendorOrders() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Đơn hàng</h1>
				<p className="text-muted-foreground">
					Quản lý đơn hàng với các trạng thái: Chờ tiếp nhận, Đã tiếp nhận, Đang
					giặt, Đã giao, Cần thanh toán, Hoàn tất, Đơn hủy. Xác nhận và thay đổi
					trạng thái đơn hàng, tính chi phí và hiển thị hoa hồng (2%).
				</p>
			</div>

			<div className="text-center py-12">
				<p className="text-muted-foreground">
					Trang này đang được phát triển...
				</p>
			</div>
		</div>
	);
}
