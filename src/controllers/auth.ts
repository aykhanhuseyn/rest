import {
	type AuthenticateSchema,
	User,
	authenticateSchema,
	srpChallengeSchema,
	srpRegisterSchema,
} from "app/models";
import type { AsyncController } from "express";
import LevelUp from "levelup";
import MemDown from "memdown";
import serverSessionFactory, {
	type PrivateStoreState,
} from "thinbus-srp/server";
import { ValidationError } from "yup";

const rfc5054 = {
	// biome-ignore lint/style/useNamingConvention: N is a constant from RFC 5054
	N: process.env.N ?? "",
	g: process.env.g ?? "",
	k: process.env.k ?? "",
};

const SRP6Session = serverSessionFactory(rfc5054.N, rfc5054.g, rfc5054.k);

const srpCache = LevelUp(MemDown());

interface ChallengeBody {
	username: string;
}
interface ChallengeResponse {
	// biome-ignore lint/style/useNamingConvention: B is a constant from RFC 5054
	B: string;
	salt: string;
}

export const srpRegister: AsyncController<
	void,
	ChallengeBody,
	ChallengeResponse
> = async (request, response) => {
	try {
		const { username, salt, verifier } = await srpRegisterSchema.validate(
			request.body,
			{ abortEarly: false },
		);

		const user = await User.findOne({ where: { username } });

		if (user === null) {
			throw new Error("Invalid username or password.");
		}

		// server generates B and b
		// sends B to client and b to a cache
		const srpServer = new SRP6Session();

		// biome-ignore lint/style/useNamingConvention: create B
		const B = srpServer.step1(username, salt, verifier);
		const privateState = srpServer.toPrivateStoreState();

		// store privateState in cache in order to use it later to verify the client's M1
		await srpCache.put(username, JSON.stringify(privateState));

		// store the private state in a temporary cache or the main DB and wait client to respond to challenge B.
		// return B and salt to the client.
		response.json({ salt, B });
	} catch (error) {
		let data: { message: string; code: string; description: string };
		switch (true) {
			case error instanceof ValidationError: {
				data = {
					message: "Invalid request.",
					code: "invalid_request",
					description: error.errors.join(", "),
				};
				break;
			}
			case error instanceof Error: {
				data = {
					message: "Invalid request.",
					code: "invalid_request",
					description: error.message,
				};
				break;
			}
			default: {
				data = {
					message: "Invalid request.",
					code: "invalid_request",
					description: "Unknown error.",
				};
			}
		}
		response.status(400).json(data);
	}
};

export const srpChallenge: AsyncController<
	void,
	ChallengeBody,
	ChallengeResponse
> = async (request, response) => {
	try {
		const { username } = await srpChallengeSchema.validate(request.body, {
			abortEarly: false,
		});

		const user = await User.findOne({
			where: { username },
			select: ["salt", "verifier"],
		});

		if (user === null) {
			throw new Error("Invalid username or password.");
		}

		const { salt, verifier } = user;

		if (salt === null || verifier === null) {
			throw new Error("Invalid username or password.");
		}

		// server generates B and b
		// sends B to client and b to a cache
		const srpServer = new SRP6Session();

		// biome-ignore lint/style/useNamingConvention: create B
		const B = srpServer.step1(username, salt, verifier);
		const privateState = srpServer.toPrivateStoreState();

		// store privateState in cache in order to use it later to verify the client's M1
		await srpCache.put(username, JSON.stringify(privateState));

		// store the private state in a temporary cache or the main DB and wait client to respond to challenge B.
		// return B and salt to the client.
		response.json({ salt, B });
	} catch (error) {
		let data: { message: string; code: string; description: string };
		switch (true) {
			case error instanceof ValidationError: {
				data = {
					message: "Invalid request.",
					code: "invalid_request",
					description: error.errors.join(", "),
				};
				break;
			}
			case error instanceof Error: {
				data = {
					message: "Invalid request.",
					code: "invalid_request",
					description: error.message,
				};
				break;
			}
			default: {
				data = {
					message: "Invalid request.",
					code: "invalid_request",
					description: "Unknown error.",
				};
			}
		}
		response.status(400).json(data);
	}
};

export const srpAuthenticate: AsyncController<void, AuthenticateSchema> =
	async (request, response) => {
		try {
			// biome-ignore lint/style/useNamingConvention:
			const { username, A, M1 } = await authenticateSchema.validate(
				request.body,
				{ abortEarly: false },
			);

			const user = await User.findOne({
				where: { username },
				select: ["verifier", "salt"],
			});

			if (!user) {
				throw new Error("Invalid username or password.");
			}

			const cacheJson: string | null = await srpCache.get(username);

			if (!cacheJson) {
				throw new Error("Invalid username or password.");
			}

			const privateState: PrivateStoreState = JSON.parse(cacheJson);
			const server = new SRP6Session();
			server.fromPrivateStoreState(privateState);

			// the server takes `A`, internally computes `M1` based on the verifier,
			// and checks that its `M1` matches the value sent from the client.
			// If not it throws an exception.
			// If the `M1` match, then the password proof is valid.
			// It then generates `M2` which is a proof that the server has the shared session key.
			// biome-ignore lint/style/useNamingConvention:
			const M2 = server.step2(A, M1);
			console.log(M2, server.getSessionKey());
			// TODO: store the session key in the user's session
			// TODO: generate jwt token and send it to the client
			response.json({ M2 });
		} catch (error) {
			let data: { message: string; code: string; description: string };
			switch (true) {
				case error instanceof ValidationError: {
					data = {
						message: "Invalid request.",
						code: "invalid_request",
						description: error.errors.join(", "),
					};
					break;
				}
				case error instanceof Error: {
					data = {
						message: "Invalid request.",
						code: "invalid_request",
						description: error.message,
					};
					break;
				}
				default: {
					data = {
						message: "Invalid request.",
						code: "invalid_request",
						description: "Unknown error.",
					};
				}
			}
			response.status(400).json(data);
		}
	};
