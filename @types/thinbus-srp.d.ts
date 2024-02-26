declare module "thinbus-srp/server" {
	export interface PrivateStoreState {
		I: string | null;
		v: string | null;
		s: string | null;
		b: string | null;
	}

	class SRP6JavascriptServerSession {
		INIT: number;
		STEP_1: number;
		STEP_2: number;
		STEP_3: number;
		state: number;
		v: BigInteger | null;
		I: string | null;
		salt: BigInteger | null;
		b: BigInteger | null;
		B: BigInteger | null;
		k: BigInteger | null;
		S: BigInteger | null;
		K: string | null;
		check(v: string, name: string): void;

		toPrivateStoreState(): PrivateStoreState;
		fromPrivateStoreState(obj: PrivateStoreState): void;

		toHex(n: BigInteger): string;
		fromHex(s: string): BigInteger;

		BigInteger(string: string, radix: number): BigInteger;

		getState(): number;
		getSessionKey(hash?: boolean): string | null;
		getUserID(): string | null;

		step1(identity: string, salt: string, verifier: string): string; // return B
		step2(Astr: string, M1client: string): string;

		computeU(Astr: string, Bstr: string): BigInteger;
		random16byteHex(): string | null;
		randomB(): BigInteger;
	}

	declare function srpServerFactory(
		N: string, // base10
		g: string, // base10
		k: string, // base16
	) {
		return 	class SRP6JavascriptServerSessionSHA256 extends SRP6JavascriptServerSession {
			N: BigInteger;
			g: BigInteger;
			H: (x: string) => string;
			k: BigInteger;
		}
	};

	export default srpServerFactory;
}

declare module "thinbus-srp" {
	declare const serverSessionFactory: SRPServerFactory;

	declare const clientSessionFactory: any;

	declare const SRP6JavascriptClientSessionSHA256: any;
}
