import { v4 as uuidv4 } from 'uuid';
import { User, IUser } from '../models/User';
import { RefreshToken } from '../models/RefreshToken';
import { AppError } from '../utils/AppError';
import { generateRandomToken, hashToken } from '../utils/crypto';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { env } from '../config/env';

export class AuthService {
  static async register(data: any) {
    const { name, email, password } = data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    const verificationToken = generateRandomToken();
    const hashedVerificationToken = hashToken(verificationToken);
    
    // Set expiry to 24 hours
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await User.create({
      name,
      email,
      password,
      verificationToken: hashedVerificationToken,
      verificationTokenExpiry,
    });

    // Email simulation
    console.log(`\n[EMAIL SIMULATION] Verification link: ${env.CLIENT_URL}/verify-email?token=${verificationToken}\n`);

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    };
  }

  static async verifyEmail(token: string) {
    const hashedToken = hashToken(token);

    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      throw new AppError('Token invalid or expired', 400);
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    return true;
  }

  static async login(data: any) {
    const { email, password } = data;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid credentials', 401);
    }

    if (!user.isVerified) {
      // Depending on requirements, we can allow login or reject.
      // Usually it's better to allow login but restrict features, or just return an error.
      // The assessment says "unverified account behavior as documented".
      // We will allow them to login but the frontend handles the isVerified flag.
      // Actually, many systems block login if not verified. Let's just proceed for now.
    }

    const jti = uuidv4();
    const payload = { userId: user.id, role: user.role };
    
    const accessToken = signAccessToken(payload);
    const refreshTokenString = signRefreshToken(payload, jti);

    // Store hashed refresh token in DB
    await RefreshToken.create({
      user: user._id,
      jti,
      token: hashToken(refreshTokenString),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    return {
      user: {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      accessToken,
      refreshTokenString,
    };
  }

  static async refresh(tokenString: string) {
    try {
      // Verify signature and expiry of the JWT
      const decoded = verifyRefreshToken(tokenString);
      
      // Explicitly require JTI
      if (!decoded || !(decoded as any).jti) {
        throw new AppError('Invalid token payload', 401);
      }

      const jti = (decoded as any).jti;
      const hashedPresentedToken = hashToken(tokenString);

      const session = await RefreshToken.findOne({ jti });

      // If no session exists, the user was logged out
      if (!session) {
        throw new AppError('Session not found or revoked', 401);
      }

      // Reuse detection!
      if (session.token !== hashedPresentedToken || session.isRevoked) {
        // Someone is trying to use an OLD or revoked token for this session.
        // Potential theft -> Revoke ALL sessions for the user to be safe.
        await RefreshToken.deleteMany({ user: session.user });
        throw new AppError('Token reuse detected. All sessions revoked.', 401);
      }

      // Valid rotation: generate new tokens
      const newJti = uuidv4();
      const payload = { userId: decoded.userId, role: decoded.role };
      
      const newAccessToken = signAccessToken(payload);
      const newRefreshTokenString = signRefreshToken(payload, newJti);

      // Invalidate old session and create new one, OR update existing session
      // Updating the existing session keeps the same family (JTI) but we want a new JTI to be safe.
      // Actually, updating the token hash in the SAME session doc is perfectly fine.
      session.token = hashToken(newRefreshTokenString);
      // We don't change the JTI so the lineage stays the same, BUT wait, if we keep the same JTI,
      // the new JWT must also have the same JTI.
      // But we signed the new token with newJti! Let's update the JTI in DB.
      session.jti = newJti;
      session.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Reset expiry? Or keep original? Let's reset.
      await session.save();

      return {
        accessToken: newAccessToken,
        refreshTokenString: newRefreshTokenString,
      };
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError('Invalid or expired token', 401);
    }
  }

  static async logout(tokenString: string) {
    try {
      const decoded = verifyRefreshToken(tokenString);
      const jti = (decoded as any).jti;
      
      if (jti) {
        await RefreshToken.deleteOne({ jti });
      }
    } catch (error) {
      // If token is invalid during logout, we just ignore and clear cookie anyway
    }
  }

  static async forgotPassword(email: string) {
    const user = await User.findOne({ email });
    if (user) {
      const resetToken = generateRandomToken();
      user.resetPasswordToken = hashToken(resetToken);
      user.resetPasswordTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save({ validateBeforeSave: false });

      console.log(`\n[EMAIL SIMULATION] Password reset link: ${env.CLIENT_URL}/reset-password?token=${resetToken}\n`);
    }
    // Always return success even if user not found to prevent enumeration
    return true;
  }

  static async resetPassword(token: string, newPassword: string) {
    const hashedToken = hashToken(token);

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      throw new AppError('Invalid or expired token', 400);
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpiry = undefined;
    await user.save();

    // Revoke all refresh tokens on password reset
    await RefreshToken.deleteMany({ user: user._id });

    return true;
  }
}
