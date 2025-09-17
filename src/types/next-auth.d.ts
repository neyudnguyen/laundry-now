import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
	interface User {
		id: string;
		phone: string;
		role: string;
		email?: string | null;
	}

	interface Session {
		user: {
			id: string;
			phone: string;
			role: string;
			email?: string | null;
		};
	}
}

declare module 'next-auth/jwt' {
	interface JWT {
		id: string;
		phone: string;
		role: string;
	}
}
