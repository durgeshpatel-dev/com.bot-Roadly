import nodemailer from 'nodemailer';
import { env } from '../config/env';

export const sendEmail = async (type: 'verify-email' | 'reset-password', token: string, email: string) => {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    console.log(`\n[EMAIL SIMULATION - NO SMTP CREDS]`);
    console.log(`Type: ${type}`);
    console.log(`Token: ${token}`);
    console.log(`Recipient: ${email}`);
    let link = '';
    if (type === 'verify-email') {
      link = `${env.CLIENT_URL}/verify-email?token=${token}`;
    } else if (type === 'reset-password') {
      link = `${env.CLIENT_URL}/reset-password?token=${token}`;
    }
    console.log(`Link: ${link}\n`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  let subject = '';
  let html = '';
  let link = '';

  if (type === 'verify-email') {
    subject = 'Verify Your Email - Roadly';
    link = `${env.CLIENT_URL}/verify-email?token=${token}`;
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
        <h2 style="color: #333;">Welcome to Roadly!</h2>
        <p style="color: #555;">Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${link}" style="background-color: #007bff; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
        </div>
        <p style="color: #999; font-size: 12px;">If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `;
  } else if (type === 'reset-password') {
    subject = 'Reset Your Password - Roadly';
    link = `${env.CLIENT_URL}/reset-password?token=${token}`;
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p style="color: #555;">We received a request to reset your password. Click the button below to choose a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${link}" style="background-color: #28a745; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </div>
        <p style="color: #999; font-size: 12px;">This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    `;
  }

  await transporter.sendMail({
    from: `"Roadly" <${env.SMTP_USER}>`,
    to: email,
    subject,
    html,
  });
};
