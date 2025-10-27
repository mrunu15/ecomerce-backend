export const sendToken = (user, statusCode, res) => {
  const token = user.getJWTToken();

  const cookieExpireDays = process.env.EXPIRE_COOKIE || 7;

  const options = {
    expires: new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", 
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", 
    overwrite: true, 
  };

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      user,
      token,
    });
};
