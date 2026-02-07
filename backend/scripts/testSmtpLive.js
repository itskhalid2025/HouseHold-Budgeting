import nodemailer from 'nodemailer';

const testSmtp = async () => {
    // Credentials provided in the image
    const config = {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: 'dazzlevaultoff@gmail.com',
            pass: 'sejsotxysuszblaf'
        }
    };

    console.log('Testing SMTP with:', config.auth.user);
    const transporter = nodemailer.createTransport(config);

    try {
        await transporter.verify();
        console.log('✅ SMTP Connection Verified!');

        const info = await transporter.sendMail({
            from: '"HouseHold Budgeting" <dazzlevaultoff@gmail.com>',
            to: 'khalidacsform@gmail.com',
            subject: 'SMTP Test - GrowWise',
            text: 'This is a test email to verify your SMTP configuration.',
            html: '<b>This is a test email to verify your SMTP configuration.</b>'
        });

        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);
    } catch (error) {
        console.error('❌ SMTP Test Failed');
        console.error('Error:', error.message);
        if (error.message.includes('Invalid login')) {
            console.log('\nHINT: Ensure "App Passwords" are enabled and the code is correct.');
        }
    }
};

testSmtp();
