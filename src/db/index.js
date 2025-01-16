import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";

const connectDb = async () => {
	try {
	 const connectionInstance =	await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
	 console.log(`\n MongoDb Connected !! DB HOST ${connectionInstance}`);
	 console.log(`\n MongoDb Connected !! DB HOST ${connectionInstance.connection.host}`);
	 
	} catch (error) {
		console.error('MONGODB CONNECTION Failed: ',error)
		process.exit(1)
	}
}

export default connectDb