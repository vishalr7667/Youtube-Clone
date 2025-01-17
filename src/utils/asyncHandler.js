// const asyncHandler = (requestHandler) => {
// 	return (req, res, next) => {
// 		Promise.resolve(requestHandler()).catch((err)=> next(err))
// 	}
// }

const asyncHandler = (requestHandler) => {
	return (req, res, next) => {
		Promise.resolve(requestHandler()).catch((err)=> next(err))
	}
}

// The asyncHandler takes a requestHandler function (typically a route handler) as a parameter and returns a middleware function. Inside this middleware, the requestHandler is executed within a Promise.resolve. This ensures that both synchronous and asynchronous code is treated uniformly. If any error occurs within the requestHandler (e.g., via throw or an unhandled rejection), it is caught in the .catch block and passed to next() as an error. Express then automatically invokes the centralized error-handling middleware to handle this error. This design ensures cleaner routes and centralized error management.

export {asyncHandler}


// const asyncHandler = ()=>{}
// const asyncHandler = (fn)=>()=>{}
// const asyncHandler = (fn)=>async()=>{}

// const asyncHandler = (fn) => async (req, res, next) => {
// 	try {
// 		await fn(req, res, next)
// 	} catch (error) {
// 		res.status(error.code || 500).json({
// 			success : false,
// 			message: error.message
// 		})
// 	}
// }