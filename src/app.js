import express from 'express';
import cookieParser from 'cookie-parser';
import cors from "cors";
import { LIMIT } from './constants.js';
import { upload } from './middlewares/multer.middleware.js';




const app = express();

app.use(cors({
	origin: process.env.CORS_ORIGIN,
	credentials:true
}))

app.use(express.json({limit: LIMIT}))
app.use(express.urlencoded({extended:true, limit:LIMIT}))
app.use(express.static("public"))
app.use(cookieParser())


export {app}