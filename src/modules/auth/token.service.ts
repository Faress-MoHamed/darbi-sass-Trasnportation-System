import { PrismaClient } from "@prisma/client";
import * as crypto from "crypto";
import { AppError } from "../../errors/AppError";

import { prisma } from "../../lib/prisma";
export class TokenService {
  private readonly TOKEN_EXPIRY_HOURS = 24;
  private readonly REFRESH_TOKEN_EXPIRY_DAYS = 30;

  private generateToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  getTokenExpiry(): Date {
    return new Date(Date.now() + this.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);
  }

  getRefreshTokenExpiry(): Date {
    return new Date(
      Date.now() + this.REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000
    );
  }

  async createTokens(userId: string, tenantId: string) {
    const token = this.generateToken();
    const refreshToken = this.generateToken();

    await prisma.accessToken.create({
      data: {
        token,
        refreshToken,
        userId,
        expiresAt: this.getTokenExpiry(),
        refreshExpiresAt: this.getRefreshTokenExpiry(),
        tenantId,
      },
    });

    return { token, refreshToken };
  }
  async createOtpTokens(userId: string) {
    const token = this.generateToken();

    await prisma.otpToken.create({
      data: {
        token,
        userId,
        expiresAt: this.getTokenExpiry(),
      },
    });

    return { token };
  }

  async refreshToken(oldRefreshToken: string) {
    const tokenRecord = await prisma.accessToken.findUnique({
      where: { refreshToken: oldRefreshToken },
      include: { user: true },
    });

    if (!tokenRecord) {
      throw new Error("Invalid refresh token");
    }

    if (
      tokenRecord.refreshExpiresAt &&
      new Date() > tokenRecord.refreshExpiresAt
    ) {
      await prisma.accessToken.delete({ where: { id: tokenRecord.id } });
      throw new Error("Refresh token has expired");
    }

    if (tokenRecord.user.status !== "active") {
      throw new Error("User account is not active");
    }

    const newToken = this.generateToken();
    const newRefreshToken = this.generateToken();

    await prisma.accessToken.update({
      where: { id: tokenRecord.id },
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
        expiresAt: this.getTokenExpiry(),
        refreshExpiresAt: this.getRefreshTokenExpiry(),
      },
    });

    return {
      token: newToken,
      refreshToken: newRefreshToken,
    };
  }

  async verifyToken(token: string) {
    const tokenRecord = await prisma.accessToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!tokenRecord) return { valid: false };

    if (tokenRecord.expiresAt && new Date() > tokenRecord.expiresAt) {
      await prisma.accessToken.delete({ where: { id: tokenRecord.id } });
      return { valid: false };
    }

    if (tokenRecord.user.status !== "active") {
      return { valid: false };
    }

    return {
      valid: true,
      userId: tokenRecord.userId,
      tenantId: tokenRecord.user.tenantId,
    };
  }

  async cleanupExpiredTokens() {
    const result = await prisma.accessToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { refreshExpiresAt: { lt: new Date() } },
        ],
      },
    });

    return result.count;
  }

  async revokeToken(token: string) {
    const tokenRecord = await prisma.accessToken.findUnique({
      where: { token },
    });
    if (tokenRecord) {
      await prisma.accessToken.delete({ where: { id: tokenRecord.id } });
    } else {
      throw new AppError("token is invalid",400)
    }
  }
}
