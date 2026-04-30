import fetch from 'node-fetch';

async function testBackend() {
  try {
    const response = await fetch('http://localhost:3000/freelancers');
    const data = await response.json();
    console.log('--- BACKEND JAVOBI ---');
    console.log('Status:', response.status);
    console.log('Muvaffaqiyatli:', data.success);
    if (!data.success) {
      console.log('Xabar:', data.message);
      console.log('Xato:', data.error);
    } else {
      console.log('Frilanserlar soni:', data.data.freelancers.length);
    }
  } catch (err) {
    console.log('Backendga ulanib bo\'lmadi:', err.message);
  }
}

testBackend();
