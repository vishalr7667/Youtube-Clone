import { Router } from "express";
import { loginUser, logoutUser, registerUser, refreshAccessToken, changeCurrentPassword, updateUserAvatar, getUserChannelProfile} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const userRouter = Router()

userRouter.route("/register").post(
	upload.fields([
		{
			name: "avatar",
			maxCount: 1
		},
		{
			name: "coverImage",
			maxCount: 1
		}
	]),
	registerUser
)

userRouter.route("/login").post(
	loginUser
)

// secured routes
userRouter.route("/logout").post(verifyJwt, logoutUser)
userRouter.route("/refresh-token").post(refreshAccessToken)
userRouter.route("/change-password").post(verifyJwt, changeCurrentPassword)
userRouter.route("/update-avatar").post(verifyJwt, upload.single("avatar"), updateUserAvatar)
userRouter.route("/getUserChannel").get(verifyJwt, getUserChannelProfile)
export default userRouter