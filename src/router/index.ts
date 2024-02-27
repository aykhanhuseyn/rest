import { Router } from "express";
import { userRouter } from "./user";
import { authRouter } from "./auth";

const router = Router();

router.get("/", (req, res) => {
	res.json({ message: "Hello, world!" });
});

router.use("/users", userRouter);
router.use("/auth", authRouter);

export { router };
