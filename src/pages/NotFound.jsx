import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg)' }}>
      <div className="rounded-2xl shadow p-8 max-w-lg w-full text-center" style={{ background: 'var(--surface)', color: 'var(--text)' }}>
        <h1 className="text-3xl font-bold">404</h1>
        <p className="mt-2" style={{ color: 'var(--muted)' }}>Bu sahifa topilmadi.</p>

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
