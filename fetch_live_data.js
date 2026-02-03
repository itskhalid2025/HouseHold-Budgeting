
import axios from 'axios';

const API_URL = 'https://household-budgeting.onrender.com/api';
const ADMIN_EMAIL = 'khalidacsform@gmail.com';
const ADMIN_PASS = 'HouseHold@@2026';

async function fetchLiveData() {
    try {
        console.log('🌐 Connecting to Live Server...');

        // 1. Login
        const loginRes = await axios.post(`${API_URL}/admin/login`, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASS
        });

        const token = loginRes.data.token;
        console.log('✅ Admin Authenticated!');

        // 2. Fetch Users
        const usersRes = await axios.get(`${API_URL}/admin/users`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        // 3. Fetch Households
        const householdsRes = await axios.get(`${API_URL}/admin/households`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('\n--- LIVE USERS ---');
        console.table(usersRes.data.users.map(u => ({
            id: u.id,
            name: `${u.firstName} ${u.lastName}`,
            email: u.email,
            household: u.household?.name || 'None'
        })));

        console.log('\n--- LIVE HOUSEHOLDS ---');
        console.table(householdsRes.data.households.map(h => ({
            id: h.id,
            name: h.name,
            members: h._count?.members || h.members?.length || 0,
            owner: h.admin?.firstName || 'Unknown'
        })));

    } catch (error) {
        console.error('❌ Error fetching live data:', error.response?.data || error.message);
    }
}

fetchLiveData();
