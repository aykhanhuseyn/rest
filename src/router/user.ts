import { list } from "app/controllers";
import { Router } from "express";

export const userRouter = Router();

userRouter.get("/", list);
