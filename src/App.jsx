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
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";

import Info from "./pages/info/Info.jsx";
import CategoryPage from "./pages/hire/CategoryPage.jsx";
import Home from "./pages/home/Index.jsx";

import JobsList from "./pages/jobs/List.jsx";
import JobDetail from "./pages/jobs/Detail.jsx";
import CreateJob from "./pages/jobs/Create.jsx";

import MyProfile from "./pages/profile/MyProfile.jsx";
import PublicProfile from "./pages/profile/PublicProfile.jsx";

import MyProposals from "./pages/proposals/MyProposals.jsx";
import Proposal from "./pages/proposals/Proposal.jsx";

import ContractsList from "./pages/contracts/List.jsx";
import ContractDetail from "./pages/contracts/Detail.jsx";

import ChatList from "./pages/chat/List.jsx";
import ChatDetail from "./pages/chat/Detail.jsx";

import Wallet from "./pages/wallet/Wallet.jsx";
import Transactions from "./pages/wallet/Transactions.jsx";

import DisputesList from "./pages/disputes/List.jsx";
import DisputeDetail from "./pages/disputes/Detail.jsx";

import NotFound from "./pages/NotFound.jsx";
import Client from './pages/profile/Client.jsx';

function App() {
  return (
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
          <Route path="/home" element={<Home />} />
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
              <Route path="/proposals" element={<Proposal />} />
              <Route path="/my-proposals" element={<MyProposals />} />
              <Route path="/proposals/new/:jobId" element={<Proposal />} />
            </Route>

            {/* Create Job (client) */}
            <Route element={<RoleRoute allow={["client"]} />}>
              <Route path="/jobs/create" element={<CreateJob />} />
            </Route>

            {/* Contracts */}
            <Route path="/contracts" element={<ContractsList />} />
            <Route path="/contracts/:id" element={<ContractDetail />} />

            {/* Messages */}
            <Route path="/messages" element={<ChatList />} />
            <Route path="/messages/:id" element={<ChatDetail />} />

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
  );
}

export default App;