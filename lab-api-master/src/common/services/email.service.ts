import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { emailConfig } from '../config/email.config';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport(emailConfig);
  }

  async sendEmail(to: string, subject: string, html: string) {
    try {
      const result = await this.transporter.sendMail({
        from: emailConfig.from,
        to,
        subject,
        html
      });
      return result;
    } catch (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async sendPasswordResetEmail(to: string, resetToken: string) {
    const subject = 'Password Reset Request';
    const html = `
      <h1>Password Reset Request</h1>
      <p>You requested to reset your password. Please use the following token:</p>
      <h2>${resetToken}</h2>
      <p>If you didn't request this, please ignore this email.</p>
    `;
    return this.sendEmail(to, subject, html);
  }

  async sendWelcomeEmail(to: string, userName: string) {
    const subject = 'Welcome to Lab Project';
    const html = `
      <h1>Welcome ${userName}!</h1>
      <p>Thank you for registering with Lab Project.</p>
      <p>We're excited to have you on board.</p>
    `;
    return this.sendEmail(to, subject, html);
  }
}