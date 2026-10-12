import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { PEOPLE, DESC } from "../data/seed";
import logo from "../assets/IITA-Logo-finalll.png";
import RegisterPage from './RegisterPage';

export default function LoginPage() {
  const { signIn } = useApp();
  const [selected, setSelected] = useState(0);
  const [showRegister, setShowRegister] = useState(false);

  if (showRegister) return <RegisterPage onBack={() => setShowRegister(false)} />;

  const person = PEOPLE[selected];
  const roleName =
    person.role === "Nursery Operator"
      ? "Seed Garden Operator / Farmer"
      : person.role;

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center p-4 relative"
      style={{ backgroundImage: "url('/cocoabg.jpg')" }}
    >
      {/* Dark overlay for contrast and readability */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[1.5px]" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand */}
        <div className="mb-6 flex justify-center">
          <div className="bg-white/95 px-4 py-2 shadow-lg border border-white/30">
            <img
              src={logo}
              alt="IITA logo"
              className="w-56 h-auto object-contain"
            />
          </div>
        </div>
        <div className="text-center pb-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
            Cocoa Seed Tracker
          </h2>
          <p className="text-xs text-amber-200/90 mt-1 font-medium tracking-wide">
            National Cocoa Seedling Traceability &amp; Certification
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 shadow-2xl p-6 sm:p-7">
          {/* Demo note */}
          <div className="border-l-4 border-[#E5B83D] bg-amber-50 px-4 py-3 text-xs text-amber-800 mb-5">
            <strong>Demo mode.</strong> Select any user profile below to explore
            the system. No real data or credentials required.
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                Sign in as
              </label>
              <select
                value={selected}
                onChange={(e) => setSelected(Number(e.target.value))}
                className="app-select w-full text-gray-900 font-medium"
              >
                {PEOPLE.map((p, i) => (
                  <option key={i} value={i}>
                    {p.name} —{" "}
                    {p.role === "Nursery Operator"
                      ? "Seed Garden Operator / Farmer"
                      : p.role}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-[#FAF8F1] border-l-2 border-[#176B3A] p-3 text-xs text-gray-600">
              Role: <strong className="text-gray-900">{roleName}</strong>
              <div className="mt-0.5 text-gray-500 font-mono text-[11px]">{person.email}</div>
            </div>

            <button
              onClick={() => signIn(selected)}
              className="action-button w-full transition-colors font-semibold"
            >
              Sign In →
            </button>
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setShowRegister(true)}
                className="text-xs font-semibold text-[#176B3A] hover:text-[#D45417] hover:underline"
              >
                Create an account
              </button>
            </div>
          </div>
        </div>

        {/* Footer Contact */}
        <div className="text-center mt-5 text-[11px] text-white/80 drop-shadow">
          Cocoa Seed Helpdesk: <span className="font-semibold text-amber-200">cacaoseed@iita.org</span> &bull; 08012345678
        </div>
      </div>
    </div>
  );
}
