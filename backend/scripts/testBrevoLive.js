import dotenv from 'dotenv';
dotenv.config();

const testBrevo = async () => {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL;

    console.log('Testing Brevo API Key...');
    console.log('Sender:', senderEmail);

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'api-key': apiKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                sender: { name: "GrowWise Test", email: senderEmail },
                to: [{ email: 'khalidacsform@gmail.com' }],
                subject: 'Brevo API Test - GrowWise',
                htmlContent: '<b>Congratulations! Your Brevo API integration is working perfectly.</b>'
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ Brevo API Success!');
            console.log('Message ID:', data.messageId);
        } else {
            console.error('❌ Brevo API Failed:', data.message || data);
            if (data.code === 'unauthorized') {
                console.log('\nHINT: The API key might be incorrect or not active for transactional emails.');
            }
        }
    } catch (error) {
        console.error('❌ Error testing Brevo:', error.message);
    }
};

testBrevo();
