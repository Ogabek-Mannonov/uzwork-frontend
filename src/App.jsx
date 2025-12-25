// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Auth sahifalari
import Signup from './pages/auth/Signup.jsx';
import Login from './pages/auth/Login.jsx';

import Home from './pages/home/Index.jsx';
import JobsList from './pages/jobs/List.jsx';
import MyProfile from './pages/profile/MyProfile.jsx';
import Info from './pages/info/Info.jsx';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Keyin Header qo‘shamiz */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/info" element={<Info />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/jobs" element={<JobsList />} />
          <Route path="/profile" element={<MyProfile />} />
          {/* Keyinroq qo‘shamiz */}
        </Routes>
        {/* Keyin Footer qo‘shamiz */}
      </div>
    </Router>
  );
}

export default App;