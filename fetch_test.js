const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjFmOWQ5MmZkLTJkYzgtNDA0My1hYzFjLWFkZTMyZjNkMWYwZSIsInJvbGUiOiJmcmVlbGFuY2VyIiwiZW1haWwiOiJtYXJ1ZkBnbWFpbC5jb20iLCJpYXQiOjE3NzQ4Njc3NTAsImV4cCI6MTc3NDg2ODY1MH0.9j8_V0hLxWA8yRjTL2VK7ntej0W4MD0z3dzH7msmbOU";

fetch("http://localhost:3000/profiles/me", {
  headers: {
    Authorization: `Bearer ${token}`
  }
})
  .then(r => r.json())
  .then(data => console.log("/profiles/me :", data))
  .catch(err => console.error(err));

fetch("http://localhost:3000/freelancers/me/portfolio", {
  headers: {
    Authorization: `Bearer ${token}`
  }
})
  .then(r => r.json())
  .then(data => console.log("/freelancers/me/portfolio :", data))
  .catch(err => console.error(err));
