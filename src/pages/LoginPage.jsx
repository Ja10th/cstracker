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
    <div className="min-h-screen bg-[#F7F8F6] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 flex justify-center">
          <img
            src={logo}
            alt="IITA logo"
            className="w-64 h-auto object-contain"
          />
        </div>
        <div>
          <h2 className="text-center pb-4 text-xl md:text-4xl font-bold">Cocoa Seed Tracker</h2>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 shadow-sm p-6">
          {/* Demo note */}
          <div className="border-l-4 border-[#E5B83D] bg-amber-50 px-4 py-3 text-xs text-amber-800 mb-5">
            <strong>Demo mode.</strong> Select any user profile below to explore
            the system. No real data or credentials required.
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1">
                Sign in as
              </label>
              <select
                value={selected}
                onChange={(e) => setSelected(Number(e.target.value))}
                className="app-select w-full"
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

            <button
              onClick={() => signIn(selected)}
              className="action-button w-full transition-colors"
            >
              Sign In →
            </button>
            <div className="text-center pt-1">
              <button type="button" onClick={() => setShowRegister(true)} className="text-sm text-[#176B3A] hover:text-[#D45417] hover:underline">
                Create an account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
