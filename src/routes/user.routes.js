import { Router } from "express";
import { loginUser, logoutUser, registerUser, refreshAccessToken, changeCurrentPassword, updateUserAvatar, getUserChannelProfile, getCurrentUser, updateAccountDetails, updateUserCoverImage, getWatchHistory} from "../controllers/user.controller.js";
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
userRouter.route("/current-user").get(verifyJwt, getCurrentUser)
userRouter.route("/update-account").patch(verifyJwt, updateAccountDetails)
userRouter.route("/update-avatar").patch(verifyJwt, upload.single("avatar"), updateUserAvatar)
userRouter.route("/cover-image").patch(verifyJwt, upload.single("coverImage"), updateUserCoverImage)
userRouter.route("/getUserChannel/:userName").get(verifyJwt, getUserChannelProfile)
userRouter.route("/watch-history").get(verify, getWatchHistory)
export default userRouter