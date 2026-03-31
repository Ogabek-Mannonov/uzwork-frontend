const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjFmOWQ5MmZkLTJkYzgtNDA0My1hYzFjLWFkZTMyZjNkMWYwZSIsInJvbGUiOiJmcmVlbGFuY2VyIiwiZW1haWwiOiJtYXJ1ZkBnbWFpbC5jb20iLCJpYXQiOjE3NzQ4Njc3NTAsImV4cCI6MTc3NDg2ODY1MH0.9j8_V0hLxWA8yRjTL2VK7ntej0W4MD0z3dzH7msmbOU";

fetch("http://localhost:3000/profiles/me", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  },
  body: JSON.stringify({
    title: "Test",
    bio: "Test bio"
  })
})
  .then(r => r.json())
  .then(data => console.log("PUT /profiles/me :", data))
  .catch(err => console.error(err));
