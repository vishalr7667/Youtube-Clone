import express from 'express';
import cookieParser from 'cookie-parser';
import cors from "cors";
import { LIMIT } from './constants.js';

const app = express();

app.use(cors({
	origin: process.env.CORS_ORIGIN,
	credentials:true
}))

app.use(express.json({limit: LIMIT}))
app.use(express.urlencoded({extended:true, limit:LIMIT}))
app.use(express.static("public"))
app.use(cookieParser())

//routes import
import userRouter from './routes/user.routes.js'

//routes declaration
app.use("/api/v1/users", userRouter);



// http://localhost:8000/api/v1/users/userRouter (which is defined in user route file and the path use in this file is treated as prefix)

export {app}