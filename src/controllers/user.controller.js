import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import isValidEmail from "../utils/checkEmail.js";
import { User } from "../models/User.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //  Algorithm to register user //

  // get data from user

  // validation - not empty

  //check if user alredy exist : userName , email

  // check for images and check for avatar

  // upload them to cloudinary, avatar

  // create user object - create entry in db

  // remove password and refresh token field from response

  // check for user creation

  // return res
  try {
    const { fullName, email, userName, password } = req.body;

    if (
      [fullName, email, userName, password].some(
        (field) => field?.trim() === ""
      )
    ) {
      throw new ApiError(400, "All field are required");
    }

    if (!isValidEmail(email)) {
      throw new ApiError(400, "Email must be in correct format");
    }

    const existedUser = await User.findOne({
      $or: [{ userName }, { email }],
    });

    if (existedUser) {
      throw new ApiError(409, "User with email or username already exist");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage?.[0]?.path || "";

    let coverImageLocalPath;

    if (
      req.files &&
      Array.isArray(req.files.coverImage) &&
      req.files.coverImage.length > 0
    ) {
      coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
      throw new ApiError(400, "Avatar is required");
    }

    const user = await User.create({
      fullName,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      userName: userName.toLowerCase(),
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    if (!createdUser) {
      throw new ApiError(
        500,
        "Something went wrong while registering the user"
      );
    }

    return res
      .status(201)
      .json(new ApiResponse(200, createdUser, "User registered successfully"));
  } catch (error) {
    console.log(error);
  }
});

const loginUser = asyncHandler(async (req, res) => {
  //  req -> data
  //  username / password
  // check username in db
  // verify password
  // access and refresh token
  // send cookie

  const { userName, email, password } = req.body;
  if (!userName && !email) {
    throw new ApiError(400, "UserName or Email is required");
  }

  const user = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User doesn't exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credential");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password, -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  }; // secure cookie

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "user logged in Successfully"
      )
    );
});

const logoutUser = asyncHandler(async(req, res) => {
	await User.findByIdAndUpdate(
		req.user._id,
		{
			$set: {
				refreshToken: undefined
			}
		},
		{
			new: true
		}
	 )

	 const options = {
		httpOnly: true,
		secure: true,
	  };

	return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(
		new ApiResponse(200, "User logout successfully")
	)
	
})

const refreshAccessToken = asyncHandler(async (req, res)=>{
   const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken){
      throw new ApiError(401, "Unauthorized request");
    }

    try {
      const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  
      const user = await User.findById(decodedToken?._id)
  
      if (!user) {
        throw new ApiError(401, "Invalid refresh token");
      } 
  
      if (incomingRefreshToken !== user.refreshToken) {
        throw new ApiError(401, "Refresh token is expired or used");  
      }
  
      const options = {
        httpOnly: true,
        secure: true,
      };
  
      const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id);
  
      return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {accessToken, refreshToken : newRefreshToken}, "Access token refreshed successfully")
      )
    } catch (error) {
        throw new ApiError(401,  error?.message || "invalid refresh token");
    }
});

const changeCurrentPassword = asyncHandler(async(req, res)=>{

  const {oldPassword, newPassword} = req.body;
  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Old password and new password is required");
  }

  const user = await User.findById(req.user?._id);

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Old password is incorrect");
  }

  user.password = newPassword;
  await user.save(validateBeforeSave = false);

  return res.status(200).json(
    new ApiResponse(200, "Password changed successfully")
  )

})

const getCurrentUser = asyncHandler(async(req,res)=>{
  return res.status(200).json(new ApiResponse(200, req.user, "User details fetched successfully"));
})

const updateAccountDetails = asyncHandler(async(req,res)=>{
  const {fullName, email} = req.body;

  if (!fullName || !email) {
    throw new ApiError(400, "Full name and email is required");
  }

  const user = await User.findByIdAndUpdate(req.user?._id, 
    {
      $set: {
        fullName,
        email
      },
    },
    {
      new: true
    }
  ).select("-password -refreshToken");

  return res.status(200)
  .json(
    new ApiResponse(200, user, "Account details updated successfully")
  )
})

const updateUserAvatar = asyncHandler(async(req,res)=>{

  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading on cloudinary");
  }

  const user = await User.findByIdAndUpdate(req.user?._id, 
    {
      $set: {
        avatar: avatar.url
      }
    },
    {
      new: true
    }
  ).select("-password -refreshToken");
  return res
  .status(200)
  .json(
    new ApiResponse(200, user, "Avatar updated successfully")
  )
});

const updateUserCoverImage = asyncHandler(async(req,res)=>{

  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "CoverImage is required");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading on cloudinary");
  }

  const user = await User.findByIdAndUpdate(req.user?._id, 
    {
      $set: {
        coverImage: coverImage.url
      }
    },
    {
      new: true
    }
  ).select("-password -refreshToken");

  return res
  .status(200)
  .json(
    new ApiResponse(200, user, "CoverImage updated successfully")
  )

})

export { registerUser , loginUser, logoutUser, refreshAccessToken, getCurrentUser, changeCurrentPassword, updateAccountDetails, updateUserAvatar, updateUserCoverImage };
