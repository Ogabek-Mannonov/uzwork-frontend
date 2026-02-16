import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow p-8 max-w-lg w-full text-center">
        <h1 className="text-3xl font-bold">404</h1>
        <p className="text-gray-600 mt-2">Bu sahifa topilmadi.</p>

        <div className="mt-6 flex gap-3 justify-center">
          <Link
            to="/home"
            className="px-4 py-2 rounded-xl bg-black text-white"
          >
            Home
          </Link>
          <Link
            to="/jobs"
            className="px-4 py-2 rounded-xl bg-gray-100"
          >
            Jobs
          </Link>
        </div>
      </div>
    </div>
  );
}
