import React from "react";
import { assets } from "../../assets/images/assets";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../../components/module/admin/Sidebar";

const Layout = () => {
  const navigate = useNavigate();

  const logout = () => {
    navigate("/");
  };
  return (
    <>
      <div className="flex items-center justify-between py-2 h-[70px] px-4 sm:px-12 border-b border-gray-200">
        <img
          onClick={() => navigate("/")}
          src={assets.logo}
          alt="Logo"
          className="w-32 sm:w-40 cursor-pointer"
        />
        <button
          onClick={logout}
          className="text-sm px-8 py-2 bg-primary text-white rounded-full cursor-pointer"
        >
          Logout
        </button>
      </div>
      <div className="flex h-[calc(100vh-70px)]">
        <Sidebar/>
        <Outlet/>
        {/* Outlet component will display the child component,
         defined as sub-routes of /admin */}
      </div>
    </>
  );
};

export default Layout;
