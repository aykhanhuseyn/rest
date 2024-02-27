import { Router } from "express";
import {
	login,
	register,
	srpChallenge,
	srpRegister,
	srpAuthenticate,
} from "app/controllers";

export const authRouter = Router();

authRouter
	.post("/srp/register", srpRegister)
	.post("/srp/challenge", srpChallenge)
	.post("/srp/authenticate", srpAuthenticate)
	.post("/login", login)
	.post("/register", register);
