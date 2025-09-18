'use client';

import { useEffect, useState } from 'react';
import { Control } from 'react-hook-form';

import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

interface Province {
	code: number;
	name: string;
	codename: string;
	division_type: string;
	phone_code: number;
}

interface District {
	code: number;
	name: string;
	codename: string;
	division_type: string;
	province_code: number;
}

interface Ward {
	code: number;
	name: string;
	codename: string;
	division_type: string;
	district_code: number;
}

interface VietnamAddressSelectorProps {
	control: Control<{
		province: string;
		district: string;
		ward: string;
		street: string;
	}>;
	onLocationChange?: (location: {
		province: string;
		district: string;
		ward: string;
	}) => void;
	defaultValues?: {
		province?: string;
		district?: string;
		ward?: string;
	};
}

const API_BASE_URL = 'https://provinces.open-api.vn/api/v1';

export function VietnamAddressSelector({
	control,
	onLocationChange,
}: VietnamAddressSelectorProps) {
	const [provinces, setProvinces] = useState<Province[]>([]);
	const [districts, setDistricts] = useState<District[]>([]);
	const [wards, setWards] = useState<Ward[]>([]);
	const [selectedProvinceCode, setSelectedProvinceCode] = useState<
		number | null
	>(null);
	const [selectedDistrictCode, setSelectedDistrictCode] = useState<
		number | null
	>(null);
	const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
	const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
	const [isLoadingWards, setIsLoadingWards] = useState(false);

	// Load provinces on component mount
	useEffect(() => {
		const fetchProvinces = async () => {
			setIsLoadingProvinces(true);
			try {
				const response = await fetch(`${API_BASE_URL}/p/`);
				const data = await response.json();
				setProvinces(data || []);
			} catch (error) {
				console.error('Error fetching provinces:', error);
			} finally {
				setIsLoadingProvinces(false);
			}
		};

		fetchProvinces();
	}, []);

	// Load districts when province changes
	useEffect(() => {
		const fetchDistricts = async () => {
			if (!selectedProvinceCode) {
				setDistricts([]);
				setWards([]);
				return;
			}

			setIsLoadingDistricts(true);
			try {
				const response = await fetch(
					`${API_BASE_URL}/p/${selectedProvinceCode}?depth=2`,
				);
				const data = await response.json();
				setDistricts(data.districts || []);
				setWards([]); // Reset wards when province changes
				setSelectedDistrictCode(null); // Reset selected district
			} catch (error) {
				console.error('Error fetching districts:', error);
			} finally {
				setIsLoadingDistricts(false);
			}
		};

		fetchDistricts();
	}, [selectedProvinceCode]);

	// Load wards when district changes
	useEffect(() => {
		const fetchWards = async () => {
			if (!selectedDistrictCode) {
				setWards([]);
				return;
			}

			setIsLoadingWards(true);
			try {
				const response = await fetch(
					`${API_BASE_URL}/d/${selectedDistrictCode}?depth=2`,
				);
				const data = await response.json();
				setWards(data.wards || []);
			} catch (error) {
				console.error('Error fetching wards:', error);
			} finally {
				setIsLoadingWards(false);
			}
		};

		fetchWards();
	}, [selectedDistrictCode]);

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
			<FormField
				control={control}
				name="province"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Tỉnh/Thành phố</FormLabel>
						<Select
							onValueChange={(value) => {
								field.onChange(value);
								const province = provinces.find((p) => p.name === value);
								setSelectedProvinceCode(province?.code || null);
							}}
							value={field.value}
							disabled={isLoadingProvinces}
						>
							<FormControl>
								<SelectTrigger>
									<SelectValue
										placeholder={
											isLoadingProvinces ? 'Đang tải...' : 'Chọn tỉnh/thành phố'
										}
									/>
								</SelectTrigger>
							</FormControl>
							<SelectContent>
								{provinces.map((province) => (
									<SelectItem key={province.code} value={province.name}>
										{province.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={control}
				name="district"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Quận/Huyện</FormLabel>
						<Select
							onValueChange={(value) => {
								field.onChange(value);
								const district = districts.find((d) => d.name === value);
								setSelectedDistrictCode(district?.code || null);
							}}
							value={field.value}
							disabled={!selectedProvinceCode || isLoadingDistricts}
						>
							<FormControl>
								<SelectTrigger>
									<SelectValue
										placeholder={
											isLoadingDistricts ? 'Đang tải...' : 'Chọn quận/huyện'
										}
									/>
								</SelectTrigger>
							</FormControl>
							<SelectContent>
								{districts.map((district) => (
									<SelectItem key={district.code} value={district.name}>
										{district.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={control}
				name="ward"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Phường/Xã</FormLabel>
						<Select
							onValueChange={(value) => {
								field.onChange(value);
								// Notify parent component about complete address
								if (selectedProvinceCode && selectedDistrictCode && value) {
									const province = provinces.find(
										(p) => p.code === selectedProvinceCode,
									);
									const district = districts.find(
										(d) => d.code === selectedDistrictCode,
									);

									if (province && district) {
										onLocationChange?.({
											province: province.name,
											district: district.name,
											ward: value,
										});
									}
								}
							}}
							value={field.value}
							disabled={!selectedDistrictCode || isLoadingWards}
						>
							<FormControl>
								<SelectTrigger>
									<SelectValue
										placeholder={
											isLoadingWards ? 'Đang tải...' : 'Chọn phường/xã'
										}
									/>
								</SelectTrigger>
							</FormControl>
							<SelectContent>
								{wards.map((ward) => (
									<SelectItem key={ward.code} value={ward.name}>
										{ward.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<FormMessage />
					</FormItem>
				)}
			/>
		</div>
	);
}
