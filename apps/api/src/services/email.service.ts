import nodemailer from 'nodemailer';
import { envConfig } from '../utils/env';
import { logger } from '../utils/logger';

export interface ReportEmailData {
  reportId: string;
  reportType: 'disaster' | 'road';
  title: string;
  description: string;
  address: string;
  district: string;
  type: string;
  reporterName?: string;
  reporterEmail?: string;
  reporterPhone?: string;
  urgencyPercentage?: number;
  riskLevel?: string;
  dangerLevel?: string;
  createdAt: Date;
  reportUrl?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // Check if email is configured
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;
    const smtpFrom = process.env.SMTP_FROM || smtpUser;

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword) {
      logger.warn('Email service not configured. SMTP credentials missing.');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort, 10),
        secure: smtpPort === '465', // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPassword,
        },
        // For development/testing with services like Mailtrap, Ethereal, etc.
        ...(envConfig.isDev && {
          tls: {
            rejectUnauthorized: false,
          },
        }),
      });

      logger.info('Email service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize email service', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Check if email service is available
   */
  isAvailable(): boolean {
    return this.transporter !== null;
  }

  /**
   * Get admin email addresses
   */
  private async getAdminEmails(): Promise<string[]> {
    try {
      const { prisma } = await import('../lib/prisma');
      const admins = await prisma.user.findMany({
        where: {
          role: 'admin',
          isActive: true,
        },
        select: {
          email: true,
        },
      });

      return admins.map((admin) => admin.email);
    } catch (error) {
      logger.error('Failed to get admin emails', {
        error: error instanceof Error ? error.message : String(error),
      });
      // Fallback to environment variable if available
      const adminEmail = process.env.ADMIN_EMAIL;
      return adminEmail ? [adminEmail] : [];
    }
  }

  /**
   * Generate HTML email template for new report notification
   */
  private generateReportEmailTemplate(data: ReportEmailData): string {
    const reportTypeLabel = data.reportType === 'disaster' ? 'Bencana' : 'Kerusakan Jalan';
    const urgencyColor =
      (data.urgencyPercentage || 0) >= 70
        ? '#dc2626' // red
        : (data.urgencyPercentage || 0) >= 40
          ? '#f59e0b' // amber
          : '#10b981'; // green

    const urgencyLabel =
      (data.urgencyPercentage || 0) >= 70
        ? 'Tinggi'
        : (data.urgencyPercentage || 0) >= 40
          ? 'Sedang'
          : 'Rendah';

    const riskLevelLabel = data.riskLevel
      ? this.capitalizeFirst(data.riskLevel)
      : data.dangerLevel
        ? this.capitalizeFirst(data.dangerLevel)
        : 'Tidak Diketahui';

    const reporterInfo = data.reporterEmail
      ? `<p><strong>Email:</strong> ${data.reporterEmail}</p>`
      : '';
    const reporterPhoneInfo = data.reporterPhone
      ? `<p><strong>Telepon:</strong> ${data.reporterPhone}</p>`
      : '';
    const reporterNameInfo = data.reporterName
      ? `<p><strong>Nama:</strong> ${data.reporterName}</p>`
      : '';

    const reporterSection =
      data.reporterEmail || data.reporterName || data.reporterPhone
        ? `
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin-top: 0; font-size: 16px;">Informasi Pelapor</h3>
          ${reporterNameInfo}
          ${reporterInfo}
          ${reporterPhoneInfo}
        </div>
      `
        : '<p style="color: #6b7280; font-style: italic;">Laporan anonim</p>';

    const reportUrl = data.reportUrl || `${process.env.APP_URL || 'http://localhost:3000'}/monitoring`;

    return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Laporan Baru - ${reportTypeLabel}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px; text-align: center;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">🚨 Laporan Baru</h1>
              <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">${reportTypeLabel}</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <h2 style="color: #1f2937; margin-top: 0; font-size: 20px; font-weight: 600;">${data.title}</h2>
              
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0;">
                <p style="margin: 0; color: #92400e; font-weight: 500;">📝 Deskripsi</p>
                <p style="margin: 5px 0 0 0; color: #78350f;">${data.description}</p>
              </div>

              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1f2937; margin-top: 0; font-size: 16px;">📍 Lokasi</h3>
                <p style="margin: 5px 0; color: #4b5563;"><strong>Alamat:</strong> ${data.address}</p>
                <p style="margin: 5px 0; color: #4b5563;"><strong>Kecamatan:</strong> ${data.district}</p>
                <p style="margin: 5px 0; color: #4b5563;"><strong>Jenis:</strong> ${this.capitalizeFirst(data.type)}</p>
              </div>

              ${reporterSection}

              <div style="display: flex; gap: 15px; margin: 20px 0; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 150px; background-color: #f3f4f6; padding: 15px; border-radius: 8px;">
                  <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Tingkat Urgensi</p>
                  <p style="margin: 5px 0 0 0; color: ${urgencyColor}; font-size: 24px; font-weight: 700;">${data.urgencyPercentage || 0}%</p>
                  <p style="margin: 5px 0 0 0; color: #4b5563; font-size: 14px;">${urgencyLabel}</p>
                </div>
                <div style="flex: 1; min-width: 150px; background-color: #f3f4f6; padding: 15px; border-radius: 8px;">
                  <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Tingkat Risiko</p>
                  <p style="margin: 5px 0 0 0; color: #1f2937; font-size: 20px; font-weight: 600;">${riskLevelLabel}</p>
                </div>
              </div>

              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 4px; margin: 20px 0;">
                <p style="margin: 0; color: #1e40af; font-size: 14px;">
                  <strong>Waktu Laporan:</strong> ${new Date(data.createdAt).toLocaleString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              <div style="text-align: center; margin: 30px 0 20px 0;">
                <a href="${reportUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">Lihat Detail Laporan</a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 30px; border-radius: 0 0 12px 12px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                Email ini dikirim secara otomatis dari sistem Smart Disaster Management.<br>
                Jangan membalas email ini.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  /**
   * Capitalize first letter of a string
   */
  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Send email notification to admins about new report
   */
  async sendNewReportNotification(data: ReportEmailData): Promise<void> {
    if (!this.isAvailable()) {
      logger.warn('Email service not available. Skipping email notification.');
      return;
    }

    try {
      const adminEmails = await this.getAdminEmails();

      if (adminEmails.length === 0) {
        logger.warn('No admin emails found. Skipping email notification.');
        return;
      }

      const reportTypeLabel = data.reportType === 'disaster' ? 'Bencana' : 'Kerusakan Jalan';
      const subject = `🚨 Laporan Baru: ${data.title} - ${reportTypeLabel}`;

      const html = this.generateReportEmailTemplate(data);

      // Send email to all admins
      const emailPromises = adminEmails.map((email) =>
        this.transporter!.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@smartdisaster.local',
          to: email,
          subject,
          html,
          // Plain text fallback
          text: `
Laporan Baru - ${reportTypeLabel}

Judul: ${data.title}
Deskripsi: ${data.description}
Alamat: ${data.address}
Kecamatan: ${data.district}
Jenis: ${this.capitalizeFirst(data.type)}
Tingkat Urgensi: ${data.urgencyPercentage || 0}%

Waktu Laporan: ${new Date(data.createdAt).toLocaleString('id-ID')}

${data.reportUrl ? `Lihat detail: ${data.reportUrl}` : ''}
          `.trim(),
        })
      );

      await Promise.all(emailPromises);

      logger.info('New report notification email sent successfully', {
        reportId: data.reportId,
        reportType: data.reportType,
        adminCount: adminEmails.length,
      });
    } catch (error) {
      // Log error but don't throw - email failure shouldn't break the report creation
      logger.error('Failed to send new report notification email', {
        error: error instanceof Error ? error.message : String(error),
        reportId: data.reportId,
        reportType: data.reportType,
      });
    }
  }

  /**
   * Test email configuration
   */
  async testEmailConnection(): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      await this.transporter!.verify();
      logger.info('Email service connection verified');
      return true;
    } catch (error) {
      logger.error('Email service connection failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }
}

export const emailService = new EmailService();

