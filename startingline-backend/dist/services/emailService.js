"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
class EmailService {
    constructor() {
        this.transporter = null;
        this.config = {
            host: process.env.SMTP_HOST || 'mail.startingline.co.za',
            port: parseInt(process.env.SMTP_PORT || '465'),
            secure: true,
            auth: {
                user: process.env.SMTP_USERNAME || 'entry@startingline.co.za',
                pass: process.env.SMTP_PASSWORD || '@#qmV@wXb5rE[m@#'
            },
            from: process.env.SMTP_FROM || 'Starting Line <entry@startingline.co.za>',
            replyTo: process.env.SMTP_REPLY_TO || 'noreply@startingline.co.za'
        };
    }
    async initializeTransporter() {
        if (!this.transporter) {
            this.transporter = nodemailer_1.default.createTransport({
                host: this.config.host,
                port: this.config.port,
                secure: this.config.secure,
                auth: this.config.auth
            });
            try {
                if (this.transporter) {
                    await this.transporter.verify();
                    console.log('✅ Email service connected successfully');
                }
            }
            catch (error) {
                console.error('❌ Email service connection failed:', error);
                throw new Error('Failed to connect to email service');
            }
        }
    }
    generateEventRegistrationHTML(data) {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Event Registration Confirmation</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .container {
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
        }
        .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .success-icon {
            text-align: center;
            margin-bottom: 20px;
        }
        .success-icon .icon {
            width: 60px;
            height: 60px;
            background-color: #10b981;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            color: white;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #1f2937;
        }
        .event-details {
            background-color: #f8fafc;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #2563eb;
        }
        .event-details h3 {
            margin: 0 0 15px 0;
            color: #1f2937;
            font-size: 18px;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding: 5px 0;
        }
        .detail-label {
            font-weight: 600;
            color: #6b7280;
        }
        .detail-value {
            color: #1f2937;
        }
        .ticket-info {
            background-color: #f0f9ff;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            border: 1px solid #bae6fd;
        }
        .ticket-info h3 {
            margin: 0 0 10px 0;
            color: #1e40af;
            font-size: 16px;
        }
        .ticket-number {
            font-family: 'Courier New', monospace;
            font-size: 18px;
            font-weight: bold;
            color: #1e40af;
            background-color: #dbeafe;
            padding: 8px 12px;
            border-radius: 4px;
            display: inline-block;
        }
        .instructions {
            background-color: #fefce8;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #eab308;
        }
        .instructions h3 {
            margin: 0 0 15px 0;
            color: #92400e;
            font-size: 16px;
        }
        .instructions ul {
            margin: 0;
            padding-left: 20px;
        }
        .instructions li {
            margin-bottom: 8px;
            color: #92400e;
        }
        .footer {
            background-color: #f8fafc;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .footer p {
            margin: 5px 0;
            color: #6b7280;
            font-size: 14px;
        }
        .logo {
            max-width: 150px;
            height: auto;
            margin-bottom: 10px;
        }
        .cta-button {
            display: inline-block;
            background-color: #2563eb;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
        }
        .cta-button:hover {
            background-color: #1d4ed8;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div style="margin-bottom: 20px;">
                <div style="height: 60px; display: flex; align-items: center; justify-content: center;">
                    <img src="https://startingline.co.za/wp-content/uploads/2025/08/cropped-SL_Logo_WtV2-300x125.png" alt="Starting Line Logo" style="max-height: 60px;">
                </div>
            </div>
            <h1>🎉 Registration Confirmed!</h1>
            <p>You're all set for ${data.eventName}</p>
        </div>
        
        <div class="content">
            <div class="success-icon">
                <div class="icon">✓</div>
            </div>
            
            <div class="greeting">
                Hi ${data.participantName},
            </div>
            
            <p>Great news! Your registration for <strong>${data.eventName}</strong> has been confirmed. We're excited to have you join us for this amazing event!</p>
            
            <div class="event-details">
                <h3>📅 Event Details</h3>
                <div class="detail-row">
                    <span class="detail-label">Event:</span>
                    <span class="detail-value">${data.eventName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">${new Date(data.eventDate).toLocaleDateString('en-ZA', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Time:</span>
                    <span class="detail-value">${data.eventTime}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Location:</span>
                    <span class="detail-value">${data.eventLocation}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Distance:</span>
                    <span class="detail-value">${data.distanceName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Organizer:</span>
                    <span class="detail-value">${data.organizerName}</span>
                </div>
            </div>
            
            <div class="ticket-info">
                <h3>🎫 Your Ticket</h3>
                <p>Your ticket number is:</p>
                <div class="ticket-number">${data.ticketNumber}</div>
                <p style="margin-top: 10px; font-size: 14px; color: #6b7280;">
                    Your official PDF ticket can be downloaded from your <a href="http://localhost:3000/participant-dashboard" style="color: #2563eb; text-decoration: underline;">dashboard</a>. Please keep it safe and bring it with you to the event.
                </p>
            </div>
            
            <div class="instructions">
                <h3>📋 Important Information</h3>
                <ul>
                    <li>Please arrive 30 minutes before the event start time</li>
                    <li>Bring a valid ID for verification</li>
                    <li>This ticket is non-transferable</li>
                    <li>Keep this ticket safe until after the event</li>
                    <li>Contact the organizer if you have any questions</li>
                </ul>
            </div>
            
            <p style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:3000/participant-dashboard" class="cta-button">View Event Details</a>
            </p>
            
            <p>We can't wait to see you at the event! If you have any questions, please don't hesitate to contact us.</p>
            
            <p>Best regards,<br>
            <strong>The Starting Line Team</strong></p>
        </div>
        
        <div class="footer">
            <p><strong>Starting Line</strong> - Your premier event management platform</p>
            <p>This email was sent to ${data.participantEmail}</p>
            <p>If you have any questions, please contact us at hello@startingline.co.za</p>
        </div>
    </div>
</body>
</html>
    `;
    }
    async sendEventRegistrationEmail(data) {
        try {
            await this.initializeTransporter();
            const html = this.generateEventRegistrationHTML(data);
            const mailOptions = {
                from: this.config.from,
                to: data.participantEmail,
                replyTo: this.config.replyTo,
                subject: `🎉 Registration Confirmed - ${data.eventName}`,
                html: html,
                attachments: data.ticketPDF ? [{
                        filename: `ticket-${data.ticketNumber}.pdf`,
                        content: data.ticketPDF,
                        contentType: 'application/pdf'
                    }] : []
            };
            if (!this.transporter) {
                throw new Error('Email transporter not initialized');
            }
            const result = await this.transporter.sendMail(mailOptions);
            console.log('✅ Event registration email sent successfully:', result.messageId);
            return true;
        }
        catch (error) {
            console.error('❌ Failed to send event registration email:', error);
            return false;
        }
    }
    async sendTestEmail(to) {
        try {
            await this.initializeTransporter();
            const mailOptions = {
                from: this.config.from,
                to: to,
                replyTo: this.config.replyTo,
                subject: 'Starting Line - Email Service Test',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">Starting Line Email Service Test</h2>
            <p>This is a test email to verify that the email service is working correctly.</p>
            <p>If you received this email, the SMTP configuration is working properly!</p>
            <hr style="margin: 20px 0;">
            <p style="color: #6b7280; font-size: 14px;">
              Sent from Starting Line Event Management System<br>
              ${new Date().toLocaleString()}
            </p>
          </div>
        `
            };
            if (!this.transporter) {
                throw new Error('Email transporter not initialized');
            }
            const result = await this.transporter.sendMail(mailOptions);
            console.log('✅ Test email sent successfully:', result.messageId);
            return true;
        }
        catch (error) {
            console.error('❌ Failed to send test email:', error);
            return false;
        }
    }
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.transporter = null;
    }
    getConfig() {
        return { ...this.config };
    }
}
exports.emailService = new EmailService();
//# sourceMappingURL=emailService.js.map