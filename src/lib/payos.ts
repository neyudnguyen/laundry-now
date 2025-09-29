import { PayOS } from '@payos/node';

if (
	!process.env.PAYOS_CLIENT_ID ||
	!process.env.PAYOS_API_KEY ||
	!process.env.PAYOS_CHECKSUM_KEY
) {
	throw new Error('Missing required PayOS environment variables');
}

const payOS = new PayOS({
	clientId: process.env.PAYOS_CLIENT_ID,
	apiKey: process.env.PAYOS_API_KEY,
	checksumKey: process.env.PAYOS_CHECKSUM_KEY,
});

export default payOS;

// Types cho PayOS
export interface PaymentData {
	orderCode: number;
	amount: number;
	description: string;
	items?: {
		name: string;
		quantity: number;
		price: number;
	}[];
	cancelUrl: string;
	returnUrl: string;
	buyerName?: string;
	buyerEmail?: string;
	buyerPhone?: string;
	buyerAddress?: string;
	expiredAt?: number;
}

export interface PaymentResponse {
	bin: string;
	accountNumber: string;
	accountName: string;
	amount: number;
	description: string;
	orderCode: number;
	currency: string;
	paymentLinkId: string;
	status: string;
	checkoutUrl: string;
	qrCode: string;
}

export interface WebhookData {
	orderCode: number;
	amount: number;
	description: string;
	accountNumber: string;
	reference: string;
	transactionDateTime: string;
	currency: string;
	paymentLinkId: string;
	code: string;
	desc: string;
	counterAccountBankId?: string | null;
	counterAccountBankName?: string | null;
	counterAccountName?: string | null;
	counterAccountNumber?: string | null;
	virtualAccountName?: string | null;
	virtualAccountNumber?: string | null;
}

export interface WebhookRequest {
	code: string;
	desc: string;
	success: boolean;
	data: WebhookData;
	signature: string;
}
