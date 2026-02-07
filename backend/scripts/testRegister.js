import fetch from 'node-fetch';

const testRegistration = async () => {
    const url = 'https://household-budgeting.onrender.com/api/auth/register';

    const payload = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test' + Date.now() + '@example.com',
        phone: '+15551234567',
        password: 'Password123',
        confirmPassword: 'Password123',
        currency: 'USD',
        country: 'United States',
        state: 'California',
        city: 'San Francisco',
        termsAccepted: true
    };

    console.log('Testing registration with payload:', JSON.stringify(payload, null, 2));

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error connecting to backend:', error.message);
        console.log('\nMake sure your backend is running on http://localhost:5000');
    }
};

testRegistration();
