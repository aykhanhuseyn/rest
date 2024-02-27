import {
	login,
	register,
	srpAuthenticate,
	srpChallenge,
	srpRegister,
} from "app/controllers";
import { Router } from "express";

export const authRouter = Router();

authRouter
	.post("/srp/register", srpRegister)
	.post("/srp/challenge", srpChallenge)
	.post("/srp/authenticate", srpAuthenticate)
	.post("/login", login)
	.post("/register", register);
