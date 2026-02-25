import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./FreeMainLayout";

import Home from "./Index";
// import FindWork from "./pages/findWork/FindWork";
// import DeliverWork from "./pages/deliverWork/DeliverWork";
// import Finances from "./pages/finances/Finances";
// import Messages from "./pages/messages/Messages";

export default function FreeApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/find-work" element={<Home />} />
          <Route path="/deliver-work" element={<Home />} />
          <Route path="/finances" element={<Home />} />
          <Route path="/messages" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}