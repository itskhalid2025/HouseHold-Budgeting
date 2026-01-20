// Test script for Phase 2 Authentication
// Run with: node testAuth.js

const baseUrl = 'http://localhost:3001/api';
let authToken = '';

// Helper function to make requests
async function makeRequest(endpoint, method = 'GET', body = null, token = '') {
    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
        method,
        headers,
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${baseUrl}${endpoint}`, options);
        const data = await response.json();
        return { status: response.status, data };
    } catch (error) {
        return { status: 'ERROR', error: error.message };
    }
}

// Test 1: User Registration
async function testRegister() {
    console.log('\n========== TEST 1: User Registration ==========');

    const testUser = {
        email: 'test@example.com',
        phone: '+1234567890',
        password: 'TestPass123',
        firstName: 'John',
        lastName: 'Doe',
        currency: 'USD'
    };

    const result = await makeRequest('/auth/register', 'POST', testUser);
    console.log(`Status: ${result.status}`);
    console.log('Response:', JSON.stringify(result.data, null, 2));

    if (result.status === 201 && result.data.token) {
        authToken = result.data.token;
        console.log('✅ Registration successful! Token saved.');
    } else {
        console.log('❌ Registration failed or user already exists');
    }

    return result;
}

// Test 2: Duplicate Email
async function testDuplicateEmail() {
    console.log('\n========== TEST 2: Duplicate Email ==========');

    const duplicateUser = {
        email: 'test@example.com', // Same email
        phone: '+9876543210',
        password: 'TestPass123',
        firstName: 'Jane',
        lastName: 'Smith',
        currency: 'USD'
    };

    const result = await makeRequest('/auth/register', 'POST', duplicateUser);
    console.log(`Status: ${result.status}`);
    console.log('Response:', JSON.stringify(result.data, null, 2));

    if (result.status === 400 && result.data.error === 'Email already registered') {
        console.log('✅ Duplicate email correctly rejected');
    } else {
        console.log('❌ Unexpected response');
    }
}

// Test 3: Weak Password
async function testWeakPassword() {
    console.log('\n========== TEST 3: Weak Password Validation ==========');

    const weakPasswordUser = {
        email: 'weak@example.com',
        phone: '+1111111111',
        password: 'weak', // Too weak
        firstName: 'Weak',
        lastName: 'Password',
        currency: 'USD'
    };

    const result = await makeRequest('/auth/register', 'POST', weakPasswordUser);
    console.log(`Status: ${result.status}`);
    console.log('Response:', JSON.stringify(result.data, null, 2));

    if (result.status === 400) {
        console.log('✅ Weak password correctly rejected');
    } else {
        console.log('❌ Weak password was accepted');
    }
}

// Test 4: User Login
async function testLogin() {
    console.log('\n========== TEST 4: User Login ==========');

    const credentials = {
        email: 'test@example.com',
        password: 'TestPass123'
    };

    const result = await makeRequest('/auth/login', 'POST', credentials);
    console.log(`Status: ${result.status}`);
    console.log('Response:', JSON.stringify(result.data, null, 2));

    if (result.status === 200 && result.data.token) {
        authToken = result.data.token;
        console.log('✅ Login successful! Token updated.');
    } else {
        console.log('❌ Login failed');
    }
}

// Test 5: Wrong Password
async function testWrongPassword() {
    console.log('\n========== TEST 5: Wrong Password ==========');

    const wrongCredentials = {
        email: 'test@example.com',
        password: 'WrongPassword123'
    };

    const result = await makeRequest('/auth/login', 'POST', wrongCredentials);
    console.log(`Status: ${result.status}`);
    console.log('Response:', JSON.stringify(result.data, null, 2));

    if (result.status === 401 && result.data.error === 'Invalid credentials') {
        console.log('✅ Wrong password correctly rejected');
    } else {
        console.log('❌ Unexpected response');
    }
}

// Test 6: Get Current User (Protected Route)
async function testGetMe() {
    console.log('\n========== TEST 6: Get Current User (Protected) ==========');

    if (!authToken) {
        console.log('❌ No auth token available. Skipping test.');
        return;
    }

    const result = await makeRequest('/auth/me', 'GET', null, authToken);
    console.log(`Status: ${result.status}`);
    console.log('Response:', JSON.stringify(result.data, null, 2));

    if (result.status === 200 && result.data.user) {
        console.log('✅ Protected route accessed successfully');
    } else {
        console.log('❌ Failed to access protected route');
    }
}

// Test 7: Protected Route Without Token
async function testProtectedWithoutToken() {
    console.log('\n========== TEST 7: Protected Route Without Token ==========');

    const result = await makeRequest('/auth/me', 'GET');
    console.log(`Status: ${result.status}`);
    console.log('Response:', JSON.stringify(result.data, null, 2));

    if (result.status === 401) {
        console.log('✅ Unauthorized access correctly blocked');
    } else {
        console.log('❌ Protected route accessible without token');
    }
}

// Test 8: Invalid Token
async function testInvalidToken() {
    console.log('\n========== TEST 8: Invalid Token ==========');

    const result = await makeRequest('/auth/me', 'GET', null, 'invalid-token-xyz');
    console.log(`Status: ${result.status}`);
    console.log('Response:', JSON.stringify(result.data, null, 2));

    if (result.status === 401) {
        console.log('✅ Invalid token correctly rejected');
    } else {
        console.log('❌ Invalid token was accepted');
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting Authentication Tests...\n');
    console.log('Testing against:', baseUrl);

    try {
        await testRegister();
        await testDuplicateEmail();
        await testWeakPassword();
        await testLogin();
        await testWrongPassword();
        await testGetMe();
        await testProtectedWithoutToken();
        await testInvalidToken();

        console.log('\n========== ALL TESTS COMPLETED ==========\n');
    } catch (error) {
        console.error('❌ Test execution error:', error.message);
    }
}

// Run tests
runAllTests();
