import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
	interface User {
		id: string;
		phone?: string;
		role: string;
		email?: string | null;
		name?: string;
	}

	interface Session {
		user: {
			id: string;
			phone?: string;
			role: string;
			email?: string | null;
			name?: string;
		};
	}
}

declare module 'next-auth/jwt' {
	interface JWT {
		id: string;
		phone?: string;
		role: string;
		name?: string;
	}
}
