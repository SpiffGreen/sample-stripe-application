import { Router } from "express";
import * as userController from "../controllers/user.controller";
import auth from "../middlewares/auth.middleware";

const userRouter = Router();

userRouter.get("/profile", auth, userController.getProfile);
userRouter.post("/signup", userController.signup);
userRouter.post("/signin", userController.signin);

export default userRouter;