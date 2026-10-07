const errorMiddleware = (err, req, res, next) => {
    console.error(err);

    // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];

    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
    });
  }
  
    const statusCode = err.statusCode || 500;
  
    res.status(statusCode).json({
      success: false,
      message:
        statusCode === 500
          ? "Internal server error"
          : err.message,
    });
  };
  
  export default errorMiddleware;