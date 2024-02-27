import { Router } from "express";
import { list } from "app/controllers";

export const userRouter = Router();

userRouter.get("/", list);
