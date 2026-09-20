import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User';
import { RefreshToken } from '../models/RefreshToken';
import { AppError } from '../utils/AppError';
import { generateRandomToken, hashToken } from '../utils/crypto';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { sendEmail } from '../utils/mailer';
import { env } from '../config/env';

const publicUser = (user: IUser) => ({
  _id: user._id.toString(), name: user.name, email: user.email, role: user.role, isVerified: user.isVerified,
});
const tokenPayload = (user: IUser) => ({
  userId: user._id.toString(), role: user.role, authVersion: user.authVersion ?? 0,
});
const expiresAt = () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

export class AuthService {
  static async register({ name, email, password }: { name: string; email: string; password: string }) {
    if (await User.exists({ email })) throw new AppError('Email already registered', 409);
    // Since email verification is removed, we instantly mark the user as verified.
    const user = await User.create({
      name, email, password,
      isVerified: true,
    });
    return publicUser(user);
  }

  static async verifyEmail(token: string) {
    const user = await User.findOneAndUpdate({
      verificationToken: hashToken(token), verificationTokenExpiry: { $gt: new Date() },
    }, {
      $set: { isVerified: true },
      $unset: { verificationToken: 1, verificationTokenExpiry: 1 },
    });
    if (!user) throw new AppError('Token invalid or expired', 400);
    return true;
  }

  static async login({ email, password }: { email: string; password: string }) {
    const user = await User.findOne({ email }).select('+password +authVersion');
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid credentials', 401);
    }
    // Assessment accounts may log in before simulated verification, as before.
    const jti = randomUUID();
    const payload = tokenPayload(user);
    const refreshTokenString = signRefreshToken(payload, jti);
    await RefreshToken.create({ user: user._id, jti, token: hashToken(refreshTokenString), expiresAt: expiresAt() });
    return { user: publicUser(user), accessToken: signAccessToken(payload), refreshTokenString };
  }

  static async refresh(tokenString: string) {
    const decoded = verifyRefreshToken(tokenString);
    const session = await RefreshToken.findOne({ jti: decoded.jti, user: decoded.userId });
    if (!session || session.expiresAt <= new Date()) throw new AppError('Session not found or expired', 401);
    const presentedHash = hashToken(tokenString);
    const revokeForReuse = async () => {
      await RefreshToken.updateMany({ user: session.user }, { $set: { isRevoked: true } });
      throw new AppError('Token reuse detected. All sessions revoked.', 401);
    };
    if (session.isRevoked || session.token !== presentedHash) return revokeForReuse();

    const user = await User.findById(session.user).select('+authVersion');
    if (!user || (decoded.authVersion ?? 0) !== (user.authVersion ?? 0)) {
      throw new AppError('Session not found or revoked', 401);
    }
    const payload = tokenPayload(user);
    // Stable JTI identifies the session; a random nonce makes each rotated JWT unique.
    // CAS prevents concurrent refreshes from issuing two usable successors.
    const refreshTokenString = signRefreshToken(payload, session.jti);
    const rotated = await RefreshToken.findOneAndUpdate({
      _id: session._id, token: presentedHash, isRevoked: false, expiresAt: { $gt: new Date() },
    }, { $set: { token: hashToken(refreshTokenString), expiresAt: expiresAt() } });
    if (!rotated) return revokeForReuse();
    return { accessToken: signAccessToken(payload), refreshTokenString };
  }

  static async logout(tokenString: string) {
    let decoded;
    try { decoded = verifyRefreshToken(tokenString); } catch { return; }
    await RefreshToken.updateOne(
      { jti: decoded.jti, user: decoded.userId }, { $set: { isRevoked: true } }
    );
  }

  static async forgotPassword(email: string) {
    const resetToken = generateRandomToken();
    const user = await User.findOneAndUpdate({ email }, { $set: {
      resetPasswordToken: hashToken(resetToken),
      resetPasswordTokenExpiry: new Date(Date.now() + 60 * 60 * 1000),
    } });
    if (user) sendEmail('reset-password', resetToken, email).catch(console.error);
    return true;
  }

  static async resetPassword(token: string, newPassword: string) {
    // A conditional update consumes the reset token once, even under concurrent requests.
    const password = await bcrypt.hash(newPassword, 12);
    const user = await User.findOneAndUpdate({
      resetPasswordToken: hashToken(token), resetPasswordTokenExpiry: { $gt: new Date() },
    }, {
      $set: { password }, $inc: { authVersion: 1 },
      $unset: { resetPasswordToken: 1, resetPasswordTokenExpiry: 1 },
    });
    if (!user) throw new AppError('Invalid or expired token', 400);
    await RefreshToken.updateMany({ user: user._id }, { $set: { isRevoked: true } });
    return true;
  }

  static async registerAdmin({ name, email, password, adminSecret }: { name: string; email: string; password: string; adminSecret: string }) {
    if (!env.ADMIN_SECRET) throw new AppError('Admin registration is not configured', 503);
    if (adminSecret !== env.ADMIN_SECRET) throw new AppError('Invalid admin secret key', 403);
    if (await User.exists({ email })) throw new AppError('Email already registered', 409);
    const user = await User.create({
      name, email, password,
      role: 'admin',
      isVerified: true,
    });
    return publicUser(user);
  }
}
