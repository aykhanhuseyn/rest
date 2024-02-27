import { User, loginSchema, userSchema } from "app/models";
import type { AsyncController } from "express";
import type { FindManyOptions } from "typeorm";

export const list: AsyncController = async (request, response) => {
	const { skip, take } = request.query;
	const params: FindManyOptions<User> = {
		skip: typeof skip === "number" ? skip : 0,
		take: typeof take === "number" ? take : 10,
	};
	const data = await User.find({ skip: params.skip, take: params.take });

	response.json(data);
};

export const login: AsyncController = async (request, response) => {
	try {
		const { username, password } = await loginSchema.validate(request.body, {
			abortEarly: false,
		});
		const user = await User.findOne({
			where: { username },
			select: ["id", "username", "password"],
		});
		if (!user) {
			throw new Error("Invalid username or password.");
		}
		// why password is undefined?
		console.log("user", username, password, user.username, user.password);
		const isVerified = await Bun.password.verify(password, user.password);
		if (!isVerified) {
			throw new Error("Invalid username or password.");
		}
		response.json(user);
	} catch (error) {
		//
		response.status(400).json({
			message:
				error && typeof error === "object" && "message" in error
					? error.message
					: "Invalid username or password.",
		});
	}
};

export const register: AsyncController = async (request, response) => {
	try {
		const { username, password } = await userSchema.validate(request.body, {
			abortEarly: false,
		});
		const isExist = await User.findOne({ where: { username }, select: ["id"] });
		if (isExist) {
			throw new Error("Username already exists.");
		}
		const hash = await Bun.password.hash(password);
		const user = User.create({
			username,
			password: hash,
		});
		await user.save();

		response.json(user);
	} catch (error) {
		console.log(error);
		//
		response.status(400).json({
			message:
				error && typeof error === "object" && "message" in error
					? error.message
					: "Invalid username or password.",
		});
	}
};
