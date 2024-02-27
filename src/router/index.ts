import { Router } from "express";
import { authRouter } from "./auth";
import { userRouter } from "./user";

const router = Router();

router.get("/", (req, res) => {
	res.json({ message: "Hello, world!" });
});

router.use("/users", userRouter);
router.use("/auth", authRouter);

export { router };
