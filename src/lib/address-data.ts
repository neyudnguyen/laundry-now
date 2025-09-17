export interface Province {
	id: string;
	name: string;
	districts: District[];
}

export interface District {
	id: string;
	name: string;
	wards: Ward[];
}

export interface Ward {
	id: string;
	name: string;
}

// Sample Vietnamese address data
export const addressData: Province[] = [
	{
		id: 'HN',
		name: 'Hà Nội',
		districts: [
			{
				id: 'HN-BA-DINH',
				name: 'Ba Đình',
				wards: [
					{ id: 'HN-BA-DINH-1', name: 'Phường Phúc Xá' },
					{ id: 'HN-BA-DINH-2', name: 'Phường Trúc Bạch' },
					{ id: 'HN-BA-DINH-3', name: 'Phường Vĩnh Phúc' },
					{ id: 'HN-BA-DINH-4', name: 'Phường Cống Vị' },
					{ id: 'HN-BA-DINH-5', name: 'Phường Liễu Giai' },
					{ id: 'HN-BA-DINH-6', name: 'Phường Nguyễn Trung Trực' },
					{ id: 'HN-BA-DINH-7', name: 'Phường Quán Thánh' },
					{ id: 'HN-BA-DINH-8', name: 'Phường Ngọc Hà' },
					{ id: 'HN-BA-DINH-9', name: 'Phường Điện Biên' },
					{ id: 'HN-BA-DINH-10', name: 'Phường Đội Cấn' },
					{ id: 'HN-BA-DINH-11', name: 'Phường Ngọc Khánh' },
					{ id: 'HN-BA-DINH-12', name: 'Phường Kim Mã' },
					{ id: 'HN-BA-DINH-13', name: 'Phường Giảng Võ' },
					{ id: 'HN-BA-DINH-14', name: 'Phường Thành Công' },
				],
			},
			{
				id: 'HN-HOAN-KIEM',
				name: 'Hoàn Kiếm',
				wards: [
					{ id: 'HN-HOAN-KIEM-1', name: 'Phường Phúc Tân' },
					{ id: 'HN-HOAN-KIEM-2', name: 'Phường Đồng Xuân' },
					{ id: 'HN-HOAN-KIEM-3', name: 'Phường Hàng Mã' },
					{ id: 'HN-HOAN-KIEM-4', name: 'Phường Hàng Buồm' },
					{ id: 'HN-HOAN-KIEM-5', name: 'Phường Hàng Đào' },
					{ id: 'HN-HOAN-KIEM-6', name: 'Phường Hàng Bồ' },
					{ id: 'HN-HOAN-KIEM-7', name: 'Phường Cửa Đông' },
					{ id: 'HN-HOAN-KIEM-8', name: 'Phường Lý Thái Tổ' },
					{ id: 'HN-HOAN-KIEM-9', name: 'Phường Hàng Bạc' },
					{ id: 'HN-HOAN-KIEM-10', name: 'Phường Hàng Gai' },
					{ id: 'HN-HOAN-KIEM-11', name: 'Phường Chương Dương Độ' },
					{ id: 'HN-HOAN-KIEM-12', name: 'Phường Hàng Trống' },
					{ id: 'HN-HOAN-KIEM-13', name: 'Phường Cửa Nam' },
					{ id: 'HN-HOAN-KIEM-14', name: 'Phường Hàng Bông' },
					{ id: 'HN-HOAN-KIEM-15', name: 'Phường Tràng Tiền' },
					{ id: 'HN-HOAN-KIEM-16', name: 'Phường Trần Hưng Đạo' },
					{ id: 'HN-HOAN-KIEM-17', name: 'Phường Phan Chu Trinh' },
					{ id: 'HN-HOAN-KIEM-18', name: 'Phường Hàng Bài' },
				],
			},
			{
				id: 'HN-CAU-GIAY',
				name: 'Cầu Giấy',
				wards: [
					{ id: 'HN-CAU-GIAY-1', name: 'Phường Nghĩa Đô' },
					{ id: 'HN-CAU-GIAY-2', name: 'Phường Nghĩa Tân' },
					{ id: 'HN-CAU-GIAY-3', name: 'Phường Mai Dịch' },
					{ id: 'HN-CAU-GIAY-4', name: 'Phường Dịch Vọng' },
					{ id: 'HN-CAU-GIAY-5', name: 'Phường Dịch Vọng Hậu' },
					{ id: 'HN-CAU-GIAY-6', name: 'Phường Quan Hoa' },
					{ id: 'HN-CAU-GIAY-7', name: 'Phường Yên Hòa' },
					{ id: 'HN-CAU-GIAY-8', name: 'Phường Trung Hòa' },
				],
			},
		],
	},
	{
		id: 'HCM',
		name: 'Thành phố Hồ Chí Minh',
		districts: [
			{
				id: 'HCM-QUAN-1',
				name: 'Quận 1',
				wards: [
					{ id: 'HCM-QUAN-1-1', name: 'Phường Tân Định' },
					{ id: 'HCM-QUAN-1-2', name: 'Phường Đa Kao' },
					{ id: 'HCM-QUAN-1-3', name: 'Phường Bến Nghé' },
					{ id: 'HCM-QUAN-1-4', name: 'Phường Bến Thành' },
					{ id: 'HCM-QUAN-1-5', name: 'Phường Nguyễn Thái Bình' },
					{ id: 'HCM-QUAN-1-6', name: 'Phường Phạm Ngũ Lão' },
					{ id: 'HCM-QUAN-1-7', name: 'Phường Cầu Ông Lãnh' },
					{ id: 'HCM-QUAN-1-8', name: 'Phường Cô Giang' },
					{ id: 'HCM-QUAN-1-9', name: 'Phường Nguyễn Cư Trinh' },
					{ id: 'HCM-QUAN-1-10', name: 'Phường Cầu Kho' },
				],
			},
			{
				id: 'HCM-QUAN-3',
				name: 'Quận 3',
				wards: [
					{ id: 'HCM-QUAN-3-1', name: 'Phường 1' },
					{ id: 'HCM-QUAN-3-2', name: 'Phường 2' },
					{ id: 'HCM-QUAN-3-3', name: 'Phường 3' },
					{ id: 'HCM-QUAN-3-4', name: 'Phường 4' },
					{ id: 'HCM-QUAN-3-5', name: 'Phường 5' },
					{ id: 'HCM-QUAN-3-6', name: 'Phường 6' },
					{ id: 'HCM-QUAN-3-7', name: 'Phường 7' },
					{ id: 'HCM-QUAN-3-8', name: 'Phường 8' },
					{ id: 'HCM-QUAN-3-9', name: 'Phường 9' },
					{ id: 'HCM-QUAN-3-10', name: 'Phường 10' },
					{ id: 'HCM-QUAN-3-11', name: 'Phường 11' },
					{ id: 'HCM-QUAN-3-12', name: 'Phường 12' },
					{ id: 'HCM-QUAN-3-13', name: 'Phường 13' },
					{ id: 'HCM-QUAN-3-14', name: 'Phường 14' },
				],
			},
			{
				id: 'HCM-BINH-THANH',
				name: 'Bình Thạnh',
				wards: [
					{ id: 'HCM-BINH-THANH-1', name: 'Phường 1' },
					{ id: 'HCM-BINH-THANH-2', name: 'Phường 2' },
					{ id: 'HCM-BINH-THANH-3', name: 'Phường 3' },
					{ id: 'HCM-BINH-THANH-5', name: 'Phường 5' },
					{ id: 'HCM-BINH-THANH-6', name: 'Phường 6' },
					{ id: 'HCM-BINH-THANH-7', name: 'Phường 7' },
					{ id: 'HCM-BINH-THANH-11', name: 'Phường 11' },
					{ id: 'HCM-BINH-THANH-12', name: 'Phường 12' },
					{ id: 'HCM-BINH-THANH-13', name: 'Phường 13' },
					{ id: 'HCM-BINH-THANH-14', name: 'Phường 14' },
					{ id: 'HCM-BINH-THANH-15', name: 'Phường 15' },
					{ id: 'HCM-BINH-THANH-17', name: 'Phường 17' },
					{ id: 'HCM-BINH-THANH-19', name: 'Phường 19' },
					{ id: 'HCM-BINH-THANH-21', name: 'Phường 21' },
					{ id: 'HCM-BINH-THANH-22', name: 'Phường 22' },
					{ id: 'HCM-BINH-THANH-24', name: 'Phường 24' },
					{ id: 'HCM-BINH-THANH-25', name: 'Phường 25' },
					{ id: 'HCM-BINH-THANH-26', name: 'Phường 26' },
					{ id: 'HCM-BINH-THANH-27', name: 'Phường 27' },
					{ id: 'HCM-BINH-THANH-28', name: 'Phường 28' },
				],
			},
		],
	},
	{
		id: 'DN',
		name: 'Đà Nẵng',
		districts: [
			{
				id: 'DN-HAI-CHAU',
				name: 'Hải Châu',
				wards: [
					{ id: 'DN-HAI-CHAU-1', name: 'Phường Thạch Thang' },
					{ id: 'DN-HAI-CHAU-2', name: 'Phường Hải Châu I' },
					{ id: 'DN-HAI-CHAU-3', name: 'Phường Hải Châu II' },
					{ id: 'DN-HAI-CHAU-4', name: 'Phường Phước Ninh' },
					{ id: 'DN-HAI-CHAU-5', name: 'Phường Hòa Thuận Tây' },
					{ id: 'DN-HAI-CHAU-6', name: 'Phường Hòa Thuận Đông' },
					{ id: 'DN-HAI-CHAU-7', name: 'Phường Nam Dương' },
					{ id: 'DN-HAI-CHAU-8', name: 'Phường Bình Hiên' },
					{ id: 'DN-HAI-CHAU-9', name: 'Phường Bình Thuận' },
					{ id: 'DN-HAI-CHAU-10', name: 'Phường Hòa Cường Bắc' },
					{ id: 'DN-HAI-CHAU-11', name: 'Phường Hòa Cường Nam' },
					{ id: 'DN-HAI-CHAU-12', name: 'Phường Thanh Bình' },
					{ id: 'DN-HAI-CHAU-13', name: 'Phường Thuận Phước' },
				],
			},
			{
				id: 'DN-SON-TRA',
				name: 'Sơn Trà',
				wards: [
					{ id: 'DN-SON-TRA-1', name: 'Phường Thọ Quang' },
					{ id: 'DN-SON-TRA-2', name: 'Phường Nại Hiên Đông' },
					{ id: 'DN-SON-TRA-3', name: 'Phường Mân Thái' },
					{ id: 'DN-SON-TRA-4', name: 'Phường An Hải Bắc' },
					{ id: 'DN-SON-TRA-5', name: 'Phường Phước Mỹ' },
					{ id: 'DN-SON-TRA-6', name: 'Phường An Hải Tây' },
					{ id: 'DN-SON-TRA-7', name: 'Phường An Hải Đông' },
				],
			},
		],
	},
];

export function getProvinces(): Province[] {
	return addressData;
}

export function getDistrictsByProvince(provinceId: string): District[] {
	const province = addressData.find((p) => p.id === provinceId);
	return province?.districts || [];
}

export function getWardsByDistrict(
	provinceId: string,
	districtId: string,
): Ward[] {
	const province = addressData.find((p) => p.id === provinceId);
	const district = province?.districts.find((d) => d.id === districtId);
	return district?.wards || [];
}

export function getProvinceById(provinceId: string): Province | undefined {
	return addressData.find((p) => p.id === provinceId);
}

export function getDistrictById(
	provinceId: string,
	districtId: string,
): District | undefined {
	const province = getProvinceById(provinceId);
	return province?.districts.find((d) => d.id === districtId);
}

export function getWardById(
	provinceId: string,
	districtId: string,
	wardId: string,
): Ward | undefined {
	const district = getDistrictById(provinceId, districtId);
	return district?.wards.find((w) => w.id === wardId);
}
