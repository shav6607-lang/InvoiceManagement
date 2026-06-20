import axios from 'axios';

/**
 * Test API connection and authentication
 * Run this in browser console to debug
 */
async function testInvoiceAPI() {
  const API_BASE_URL = 'https://localhost:44354/api';
  const token = localStorage.getItem('token');

  console.log('🧪 Testing Invoice API...');
  console.log('Token:', token);
  
  try {
    // Test 1: Without authentication
    console.log('\n1️⃣ Testing WITHOUT authentication header...');
    const response1 = await axios.get(`${API_BASE_URL}/Invoice/GetInvoiceList`, {
      httpsAgent: { rejectUnauthorized: false }
    });
    console.log('✅ Success without auth:', response1.data);
    return;
  } catch (error: any) {
    console.log('❌ Failed without auth:', error.response?.status, error.response?.data);
  }

  try {
    // Test 2: With Bearer token
    console.log('\n2️⃣ Testing WITH Bearer token...');
    const response2 = await axios.get(`${API_BASE_URL}/Invoice/GetInvoiceList`, {
      headers: { Authorization: `Bearer ${token}` },
      httpsAgent: { rejectUnauthorized: false }
    });
    console.log('✅ Success with Bearer:', response2.data);
    return;
  } catch (error: any) {
    console.log('❌ Failed with Bearer:', error.response?.status, error.response?.data);
  }

  try {
    // Test 3: With token directly
    console.log('\n3️⃣ Testing WITH token directly (no Bearer)...');
    const response3 = await axios.get(`${API_BASE_URL}/Invoice/GetInvoiceList`, {
      headers: { Authorization: token },
      httpsAgent: { rejectUnauthorized: false }
    });
    console.log('✅ Success with direct token:', response3.data);
    return;
  } catch (error: any) {
    console.log('❌ Failed with direct token:', error.response?.status, error.response?.data);
  }

  try {
    // Test 4: Custom header
    console.log('\n4️⃣ Testing WITH custom X-Auth-Token header...');
    const response4 = await axios.get(`${API_BASE_URL}/Invoice/GetInvoiceList`, {
      headers: { 'X-Auth-Token': token },
      httpsAgent: { rejectUnauthorized: false }
    });
    console.log('✅ Success with X-Auth-Token:', response4.data);
    return;
  } catch (error: any) {
    console.log('❌ Failed with X-Auth-Token:', error.response?.status, error.response?.data);
  }

  console.log('\n⚠️ All authentication methods failed!');
  console.log('Please check:');
  console.log('1. Is the token valid from your backend?');
  console.log('2. Is the API endpoint correct: https://localhost:44354/api/Invoice/GetInvoiceList');
  console.log('3. What authentication method does your backend expect?');
}

// Run test
testInvoiceAPI();
