import {v2 as cloudinary} from "cloudinary";
import fs from "fs";

 // Configuration
 cloudinary.config({ 
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
	api_key: process.env.CLOUDINARY_API_KEY, 
	api_secret: process.env.CLOUDINARY_API_SECRET// Click 'View API Keys' above to copy your API secret
});

export const uploadOnCloudinary = async (localFilePath) =>{
	try {
		if (!localFilePath) return null
		// upload the file on cloudinary
		
		const response = await cloudinary.uploader.upload(localFilePath, {
			resource_type: "auto"
		});		
		// file has been uploaded successfully
		fs.unlinkSync(localFilePath);
		return response;
	} catch (error) {
		fs.unlinkSync(localFilePath); // remove the file from local server as the upload operation got failed
		return null;
	}
}

export const deleteFromCloudinary = async (publicId) =>{
	try {
		if (!publicId) return null;
		// delete the file from cloudinary
		const response = await cloudinary.uploader.destroy(publicId);
		return response;
	} catch (error) {
		return null;
	}
}


