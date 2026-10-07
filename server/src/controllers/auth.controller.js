import userService from "../services/user.service.js";
import authService from "../services/auth.service.js";

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  const user = await userService.createUser({
    name,
    email,
    password,
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: {
      user,
    },
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const {
    accessToken,
    refreshToken,
    user,
  } = await authService.login({
    email,
    password,
  });

  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api/v1/auth",
  });

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user,
    },
  });
};