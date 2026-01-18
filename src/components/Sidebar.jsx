import React, { useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User2,
  PlusIcon,
  ChevronDown,
  Building2,
  Users,
  Layers,
  Building,
  FolderPlus,
} from "lucide-react";
import { useAuth } from "../providers/AuthProvider.jsx";
import { toast } from "react-toastify";

const Sidebar = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const { logoutInstitution, logoutUser } = useAuth();

  const { institution, user } = useSelector((s) => s.auth);

  const [mobileOpen, setMobileOpen] = useState(false);

  // dropdown groups state
  const [openGroups, setOpenGroups] = useState({
    faculties: false,
    departments: false,
  });

  const toggleGroup = (key) => {
    setOpenGroups((p) => ({ ...p, [key]: !p[key] }));
  };

  const config = useMemo(() => {
    // INSTITUTION
    if (institution.isAuthenticated) {
      return {
        title: "Institution",
        subtitle: institution.data?.name || "Dashboard",
        avatar: institution.data?.avatar || null,

        items: [
          { label: "Dashboard", to: "/institution/dashboard", icon: LayoutDashboard },
          { label: "Profile", to: "/institution/profile", icon: User2 },
        ],

        groups: [
          {
            key: "faculties",
            label: "Faculties",
            icon: Users,
            items: [
              
            ],
          },
          {
            key: "departments",
            label: "Departments",
            icon: Building2,
            items: [
              { label: "All Departments", to: "/institution/departments", icon: Building },
              { label: "Create Department", to: "/institution/departments/create", icon: FolderPlus },
            ],
          },
        ],

        logout: () => {
          logoutInstitution();
          toast.success("Logged Out");
          navigate("/institution/login", { replace: true });
        },
      };
    }

    // USER
    if (user.isAuthenticated) {
      const role = user.data?.role?.toLowerCase();

      return {
        title: user.data?.role || "User",
        subtitle: user.data?.name || "Dashboard",
        avatar: user.data?.avatar || null,

        items: [
          { label: "Dashboard", to: `/${role}/dashboard`, icon: LayoutDashboard },
          { label: "Profile", to: `/${role}/profile`, icon: User2 },
        ],

        groups: [],

        logout: () => {
          logoutUser();
          navigate(`/${role}/login`, { replace: true });
        },
      };
    }

    return null;
  }, [
    institution.isAuthenticated,
    institution.data,
    user.isAuthenticated,
    user.data,
    logoutInstitution,
    logoutUser,
    navigate,
  ]);

  if (!config) return null;

  const SidebarLink = ({ item, isMobile }) => {
    const Icon = item.icon;

    return (
      <NavLink
        to={item.to}
        onClick={() => isMobile && setMobileOpen(false)}
        className={({ isActive }) =>
          `group flex items-center gap-3 rounded-xl px-3 py-3 font-semibold transition border
          ${
            isActive
              ? "bg-indigo-50 text-indigo-700 border-indigo-200"
              : "bg-white text-slate-700 border-transparent hover:bg-slate-50"
          }`
        }
        title={collapsed ? item.label : undefined}
      >
        <Icon className="h-5 w-5 shrink-0" />
        {!collapsed && <span className="text-sm">{item.label}</span>}
      </NavLink>
    );
  };

  const SidebarGroup = ({ group, isMobile }) => {
    const GroupIcon = group.icon;
    const isOpen = openGroups[group.key];

    return (
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => toggleGroup(group.key)}
          className={`w-full flex items-center justify-between gap-3 rounded-xl px-3 py-3 font-bold transition border
            hover:bg-slate-50
            ${isOpen ? "bg-slate-50 border-slate-200" : "bg-white border-transparent"}
          `}
          title={collapsed ? group.label : undefined}
        >
          <div className="flex items-center gap-3">
            <GroupIcon className="h-5 w-5 shrink-0 text-slate-800" />
            {!collapsed && <span className="text-sm text-slate-800">{group.label}</span>}
          </div>

          {!collapsed && (
            <ChevronDown
              className={`h-4 w-4 text-slate-600 transition ${
                isOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          )}
        </button>

        {/* group items */}
        {isOpen && (
          <div className={`${collapsed ? "" : "pl-3"} flex flex-col gap-2`}>
            {group.items.map((item) => (
              <SidebarLink key={item.to} item={item} isMobile={isMobile} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const SidebarContent = ({ isMobile = false }) => (
    <aside
      className={`
        h-screen bg-white border-r border-slate-200 flex flex-col
        transition-all duration-300
        ${collapsed && !isMobile ? "w-20" : "w-72"}
      `}
    >
      {/* Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200">
        {!collapsed && (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
              {config.avatar ? (
                <img
                  src={config.avatar}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm font-bold text-slate-600">
                  {config.title?.[0] || "U"}
                </div>
              )}
            </div>

            <div className="leading-tight">
              <h1 className="text-sm font-extrabold text-slate-900 truncate">
                {config.title}
              </h1>
              <p className="text-xs text-slate-500 truncate">{config.subtitle}</p>
            </div>
          </div>
        )}

        {/* Collapse toggle (desktop only) */}
        {!isMobile && (
          <button
            onClick={() => setCollapsed((p) => !p)}
            className="h-10 w-10 rounded-xl border border-slate-200 hover:bg-slate-50 transition grid place-items-center shrink-0"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            type="button"
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5 text-slate-800" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-slate-800" />
            )}
          </button>
        )}

        {/* Close button (mobile only) */}
        {isMobile && (
          <button
            onClick={() => setMobileOpen(false)}
            className="h-10 w-10 rounded-xl border border-slate-200 hover:bg-slate-50 transition grid place-items-center shrink-0"
            type="button"
          >
            <X className="h-5 w-5 text-slate-800" />
          </button>
        )}
      </div>

      {/* Menu */}
      <div className="px-3 py-4 flex-1 overflow-y-auto">
        {!collapsed && (
          <p className="text-[11px] font-bold text-slate-400 tracking-wider mb-3 px-2">
            MENU
          </p>
        )}

        <nav className="flex flex-col gap-2">
          {/* normal items */}
          {config.items.map((item) => (
            <SidebarLink key={item.to} item={item} isMobile={isMobile} />
          ))}

          {/* grouped dropdowns */}
          {config.groups?.length > 0 && (
            <div className="mt-3 space-y-3">
              {!collapsed && (
                <p className="text-[11px] font-bold text-slate-400 tracking-wider px-2">
                  MANAGE
                </p>
              )}

              {config.groups.map((group) => (
                <SidebarGroup key={group.key} group={group} isMobile={isMobile} />
              ))}
            </div>
          )}
        </nav>
      </div>

      {/* Logout (bottom) */}
      <div className="p-3 border-t border-slate-200">
        <button
          onClick={config.logout}
          className="w-full flex items-center gap-3 rounded-xl px-3 py-3 font-semibold
          border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition"
          type="button"
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 z-40 flex items-center px-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="h-10 w-10 rounded-xl border border-slate-200 hover:bg-slate-50 transition grid place-items-center"
          type="button"
        >
          <Menu className="h-5 w-5 text-slate-800" />
        </button>

        <div className="ml-3 font-bold text-slate-900 truncate">{config.title}</div>
      </div>

      {/* Desktop fixed sidebar */}
      <div
        className={`
          hidden lg:block fixed left-0 top-0 h-screen z-30
        `}
      >
        <SidebarContent />
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full">
            <SidebarContent isMobile />
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
