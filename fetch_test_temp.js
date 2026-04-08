const fetch = require('node-fetch'); // or native fetch if Node 18+
async function test() {
  try {
    const res = await fetch('http://localhost:5000/api/projects');
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error:", err.message);
  }
}
test();
