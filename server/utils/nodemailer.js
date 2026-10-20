const nodemailer = require('nodemailer');

/**
 * Configure Nodemailer transporter based on .env values.
 * Uses Gmail SMTP by default, but falls back to logging to console
 * if valid credentials are not provided.
 */
const getTransporter = () => {
  // Check if standard credentials are set
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  const isConfigured = emailUser && 
                       emailUser !== 'your_email@gmail.com' && 
                       emailUser.trim() !== '' &&
                       emailPass && 
                       emailPass !== 'your_gmail_app_password' && 
                       emailPass.trim() !== '';

  if (!isConfigured) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail', // Force gmail for ease of use
    auth: {
      user: emailUser,
      pass: emailPass, // Must be a 16-digit App Password
    },
  });
};

/**
 * Sends a 6-digit OTP verification code to the student email address.
 * @param {string} email 
 * @param {string} code 
 */
const sendOTP = async (email, code) => {
  const transporter = getTransporter();

  if (!transporter) {
    console.log('\n======================================================');
    console.log(`📧  [DEV MODE OTP] No real email credentials configured in server/.env.`);
    console.log(`👉  To send real emails, set EMAIL_USER & EMAIL_PASS in .env.`);
    console.log(`🔑  Verification Code for ${email} is: ${code}`);
    console.log('======================================================\n');
    return { success: true, mode: 'console', code };
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"CampusShare Support" <noreply@campusresource.com>',
    to: email,
    subject: 'CampusShare - Email Verification OTP',
    text: `Your account verification code is ${code}. This code is valid for 15 minutes.`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 550px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 20px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <div style="text-align: center; margin-bottom: 25px;">
          <h2 style="color: #4f46e5; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">CampusShare Platform</h2>
          <p style="color: #64748b; font-size: 14px; margin-top: 5px;">College Resource Exchange Network</p>
        </div>
        
        <div style="height: 1px; bg-color: #f1f5f9; background: #f1f5f9; margin-bottom: 25px;"></div>
        
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">Hello,</p>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">Thank you for joining CampusShare. Please verify your student email address by entering the 6-digit verification code below:</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 16px; text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #1e1b4b; font-family: monospace;">${code}</span>
        </div>
        
        <p style="color: #64748b; font-size: 13px; line-height: 1.6;">This code is private and expires in 15 minutes. Please do not share it with anyone else.</p>
        
        <div style="height: 1px; bg-color: #f1f5f9; background: #f1f5f9; margin: 25px 0;"></div>
        
        <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">
          If you did not request this code, you can safely ignore this email.<br/>
          &copy; ${new Date().getFullYear()} CampusShare Network.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧  Email sent successfully to ${email}. MessageId: ${info.messageId}`);
    return { success: true, mode: 'email', info };
  } catch (error) {
    console.error('\n❌  Nodemailer Email Delivery Failure:');
    console.error(error.message);
    console.log(`⚠️   Falling back to console print.`);
    console.log(`🔑  Verification Code for ${email} is: ${code}\n`);
    return { success: false, mode: 'fallback_console', error: error.message, code };
  }
};

module.exports = { sendOTP };
