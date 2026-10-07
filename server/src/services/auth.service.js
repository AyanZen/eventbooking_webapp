import bcrypt from "bcrypt";

import User from "../models/User.model.js";
import Session from "../models/Session.model.js";

import { generateAccessToken } from "../utils/jwt.util.js";
import {
  generateRefreshToken,
  hashToken,
} from "../utils/token.util.js";

const REFRESH_TOKEN_DAYS = 7;

const login = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+password");

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordValid) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error("Account is inactive");
    error.statusCode = 403;
    throw error;
  }

  const accessToken = generateAccessToken({
    userId: user._id.toString(),
    role: user.role,
  });

  const refreshToken = generateRefreshToken();

  const refreshTokenHash = hashToken(refreshToken);

  const expiresAt = new Date(
    Date.now() +
      REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000
  );

  await Session.create({
    user: user._id,
    refreshTokenHash,
    expiresAt,
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

const refresh = async (refreshToken) => {
    if (!refreshToken) {
      const error = new Error("Refresh token is required");
      error.statusCode = 401;
      throw error;
    }
  
    const refreshTokenHash = hashToken(refreshToken);
  
    const session = await Session.findOne({
      refreshTokenHash,
    }).populate("user");
  
    if (!session) {
      const error = new Error("Invalid refresh token");
      error.statusCode = 401;
      throw error;
    }
  
    if (session.revokedAt) {
      const error = new Error("Refresh token has been revoked");
      error.statusCode = 401;
      throw error;
    }
  
    if (session.expiresAt <= new Date()) {
      const error = new Error("Refresh token has expired");
      error.statusCode = 401;
      throw error;
    }
  
    const user = session.user;
  
    if (!user || !user.isActive) {
      const error = new Error("Account is inactive");
      error.statusCode = 403;
      throw error;
    }
  
    // Revoke the old session
    session.revokedAt = new Date();
    session.lastUsedAt = new Date();
  
    await session.save();
  
    // Generate a new token pair
    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      role: user.role,
    });
  
    const newRefreshToken = generateRefreshToken();
  
    const newRefreshTokenHash = hashToken(newRefreshToken);
  
    const expiresAt = new Date(
      Date.now() +
        REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000
    );
  
    await Session.create({
      user: user._id,
      refreshTokenHash: newRefreshTokenHash,
      expiresAt,
    });
  
    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  };

export default {
  login,
  refresh,
};