import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen w-full bg-slate-50">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div
        className={`
          min-h-screen
          pt-14 lg:pt-0
          transition-all duration-300
          ${collapsed ? "lg:pl-20" : "lg:pl-72"}
        `}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
