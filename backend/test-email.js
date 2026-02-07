import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

async function main() {
    console.log('User:', process.env.SMTP_USER);
    console.log('Pass:', process.env.SMTP_PASS ? '******' + process.env.SMTP_PASS.slice(-4) : 'Not Set');

    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: "michaeljacksonforevermjrocks@gmail.com",
            subject: "Test Email from Household Budget",
            text: "If you receive this, the email configuration is working!",
            html: "<b>If you receive this, the email configuration is working!</b>",
        });

        console.log("Message sent: %s", info.messageId);
    } catch (error) {
        console.error("Error sending email:", error);
    }
}

main();
