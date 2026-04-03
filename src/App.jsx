// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

/* Layouts */
import MainLayout from "./layouts/MainLayout.jsx";
import AuthLayout from "./layouts/AuthLayout.jsx";

/* Routing guards */
import ProtectedRoute from "./pages/components/routing/ProtectedRoute.jsx";
import RoleRoute from "./pages/components/routing/RoleRoute.jsx";

/* Pages */
import Signup from "./pages/auth/Signup.jsx";
import Login from "./pages/auth/Login.jsx";
import { ThemeProvider } from "./pages/components/Theme/ThemeContext.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";

import Info from "./pages/info/Info.jsx";
import CategoryPage from "./pages/hire/CategoryPage.jsx";


import JobsList from "./pages/Landing/jobs/List.jsx";
import JobDetail from "./pages/Landing/jobs/Detail.jsx";
import CreateJob from "./pages/Landing/jobs/Create.jsx";

import MyProfile from "./pages/profile/MyProfile.jsx";
import PublicProfile from "./pages/profile/PublicProfile.jsx";

import MyProposals from "./pages/Landing/proposals/MyProposals.jsx";
import Proposal from "./pages/Landing/proposals/Proposal.jsx";

import ContractsList from "./pages/Landing/contracts/List.jsx";
import ContractDetail from "./pages/Landing/contracts/Detail.jsx";

import ChatList from "./pages/Landing/chat/List.jsx";
import ChatDetail from "./pages/Landing/chat/Detail.jsx";

import Wallet from "./pages/Landing/wallet/Wallet.jsx";
import Transactions from "./pages/Landing/wallet/Transactions.jsx";

import DisputesList from "./pages/Landing/disputes/List.jsx";
import DisputeDetail from "./pages/Landing/disputes/Detail.jsx";

import NotFound from "./pages/NotFound.jsx";
import Client from './pages/Client/Client.jsx';
import ClientHome from "./pages/Client/Landing.jsx";
import FindTalent from "./pages/Client/FindTalent.jsx";
import PostJob from "./pages/Client/PostJob.jsx";


// =================== Freelancer Pages =====================
import FindWork from "./pages/Freelancer/FindW/FindWork.jsx";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
        {/* Public landing */}
        <Route path="/" element={<Info />} />
        <Route path="/hire/cold-callers" element={<CategoryPage />} />

        {/* Auth pages (separate layout) */}
        <Route element={<AuthLayout />}>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Main app layout */}
        <Route element={<MainLayout />}>
          {/* Default redirect */}
          <Route path="/app" element={<Navigate to="/home" replace />} />

          {/* Public-ish inside app */}
          <Route path="/jobs" element={<JobsList />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/profile/:id" element={<PublicProfile />} />
          <Route path="/profile/client" element={<Client />} />

          {/* Protected area */}
          <Route element={<ProtectedRoute />}>
            {/* Profile */}
            <Route path="/profile" element={<MyProfile />} />

            {/* Proposals (freelancer) */}
            <Route element={<RoleRoute allow={["freelancer"]} />}>
              <Route path="/find-work" element={<FindWork />} />
              <Route path="/proposals" element={<Proposal />} />
              <Route path="/my-proposals" element={<MyProposals />} />
              <Route path="/proposals/new/:jobId" element={<Proposal />} />
            </Route>

            {/* Create Job (client) */}
            <Route element={<RoleRoute allow={["client"]} />}>
              <Route path="/jobs/create" element={<CreateJob />} />
            </Route>
            <Route path="/client/job/:id" element={<ClientHome />} />
            <Route path="/client/talent" element={<FindTalent />} />
            <Route path="/client/postjob" element={<PostJob />} />

            {/* Contracts */}
            <Route path="/contracts" element={<ContractsList />} />
            <Route path="/contracts/:id" element={<ContractDetail />} />

            {/* Messages */}
            <Route path="/messages" element={<ChatList />}>
              <Route path=":id" element={<ChatDetail />} />
            </Route>

            {/* Wallet */}
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/wallet/transactions" element={<Transactions />} />

            {/* Disputes */}
            <Route path="/disputes" element={<DisputesList />} />
            <Route path="/disputes/:id" element={<DisputeDetail />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  </ThemeProvider>
  );
}

export default App;