import React from "react";
import { useApp } from "../context/AppContext";
import Icon from "./Icon";
import logo from "../assets/IITA-Logo-finalll.png";
import { getRoleNavigation } from "./roles/navigation";

export default function Sidebar() {
  const {
    currentUser,
    currentPage,
    sidebarOpen,
    navigate,
    signOut,
    closeSidebar,
    permissions,
  } = useApp();
  if (!currentUser) return null;

  const navItems = getRoleNavigation(currentUser.role).filter(
    (p) => p.perm === null || permissions.includes(p.perm),
  );

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <aside
      
        className={[
          "fixed top-0 left-0 h-full w-[244px] bg-white border-r border-gray-200 flex flex-col z-40 transition-transform duration-200",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
        aria-label="Main navigation"
      >
        {/* Brand */}
        <div className="px-2 py-5 ">
          <img
            src={logo}
            alt="IITA logo"
            className="w-full max-w-[154px] h-auto object-contain"
          />
        </div>

        {/* Nav */}
        <nav
          className="flex-1 overflow-y-auto py-3"
          aria-label="Site navigation"
        >
          {navItems.map((page) => {
            const active = currentPage === page.key;
            return (
              <button
                key={page.key}
                onClick={() => navigate(page.key)}
                className={[
                  "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left",
                  active
                    ? "bg-[#176B3A]/8 text-[#176B3A] font-semibold"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                ].join(" ")}
                aria-current={active ? "page" : undefined}
              >
                <Icon name={page.icon} className="w-4 h-4 shrink-0" />
                {page.label}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t border-gray-100 p-4">
          <button
            onClick={signOut}
            className="w-full flex items-center justify-between gap-2    px-3 py-2 text-sm  text-gray-500 hover:bg-red-50 hover:text-red-700 transition-colors"
            title="Sign out"
            aria-label="Sign out"
          >
            <span className="flex items-center gap-2"><Icon name="logout" className="w-4 h-4" />Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
