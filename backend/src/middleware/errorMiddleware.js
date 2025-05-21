const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    data: false,
    message: err.message || "Server Error",
  });
};

export default errorHandler;
