import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH = process.env.JWT_SECRET_REFRESH;

export const generateToken = (user) => {
  const userId = user._id || user.id;
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "1d" });
};

export const generateRefreshToken = (user) => {
  const userId = user._id || user.id;
  return jwt.sign({ id: userId }, JWT_REFRESH, { expiresIn: "30d" });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error("verifyToken error:", error.message);
    return null;
  }
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH);
  } catch (error) {
    console.error("verifyRefreshToken error:", error.message);
    return null;
  }
};
