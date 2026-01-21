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
  ChevronDown,
  Building2,
  Building,
  Moon,
  Sun,
  GraduationCap,
  PlusSquare,
  List,
  BookOpen,
  ListChecks,
  LayoutGrid,
  UserCircle,
  Grid3X3,
  UserPen,
} from "lucide-react";
import { useAuth } from "../providers/AuthProvider.jsx";
import { toast } from "react-toastify";
import { useTheme } from "../theme/ThemeProvider.jsx";

const Sidebar = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const { logoutInstitution, logoutUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const { institution, user } = useSelector((s) => s.auth);

  const [mobileOpen, setMobileOpen] = useState(false);

  // dropdown groups state
  const [openGroups, setOpenGroups] = useState({
    faculties: false,
    departments: false,
    branches: false,
    courses: false,
  });


  const toggleGroup = (key) => {
    setOpenGroups((prev) => {
      const next = Object.keys(prev).reduce((acc, k) => {
        acc[k] = false;
        return acc;
      }, {});

      next[key] = !prev[key];
      return next;
    });
  };



  const config = useMemo(() => {
    // INSTITUTION
    if (institution.isAuthenticated) {
      return {
        title: "Institution",
        subtitle: institution.data?.name || "Dashboard",
        avatar: institution.data?.avatar || null,

        items: [
          { label: "Dashboard", to: "/institution/dashboard", icon: Grid3X3 },
          { label: "Profile", to: "/institution/profile", icon: UserCircle },
        ],

        groups: [
          {
            key: "faculties",
            label: "Faculties",
            icon: GraduationCap,
            items: [
              {
                label: "All Faculties",
                to: "/institution/faculties",
                icon: UserPen,
                end: true,
              },
            ],
          },

          {
            key: "departments",
            label: "Departments",
            icon: Building2,
            items: [
              {
                label: "All Departments",
                to: "/institution/departments",
                icon: Building,
                end: true,
              },
              {
                label: "Create Department",
                to: "/institution/departments/create",
                icon: PlusSquare,
              },
            ],
          },

          {
            key: "branches",
            label: "Branches",
            icon: LayoutGrid,
            items: [
              {
                label: "All Branches",
                to: "/institution/branches",
                icon: List,
                end: true,
              },
              {
                label: "Create Branch",
                to: "/institution/branches/create",
                icon: PlusSquare,
              },
            ],
          },

          {
            key: "courses",
            label: "Courses",
            icon: BookOpen,
            items: [
              {
                label: "All Courses",
                to: "/institution/courses",
                icon: ListChecks,
                end: true,
              },
              {
                label: "Create Course",
                to: "/institution/courses/create",
                icon: PlusSquare,
              },
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
        end={item.end}
        onClick={() => isMobile && setMobileOpen(false)}
        className={({ isActive }) =>
          `group flex items-center gap-3 rounded-xl px-3 py-2 font-semibold transition border
          ${isActive
            ? "bg-[var(--active-bg)] text-[var(--active-text)] border-[var(--active-border)]"
            : "bg-transparent text-[var(--text)] border-transparent hover:bg-[var(--hover)]"
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
          className={`w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2 font-bold transition border
            hover:bg-[var(--hover)]
            ${isOpen
              ? "bg-[var(--hover)] border-[var(--border)]"
              : "bg-transparent border-transparent"
            }
          `}
          title={collapsed ? group.label : undefined}
        >
          <div className="flex items-center gap-3">
            <GroupIcon className="h-5 w-5 shrink-0 text-[var(--text)]" />
            {!collapsed && (
              <span className="text-sm text-[var(--text)]">{group.label}</span>
            )}
          </div>

          {!collapsed && (
            <ChevronDown
              className={`h-4 w-4 text-[var(--muted-text)] transition ${isOpen ? "rotate-180" : "rotate-0"
                }`}
            />
          )}
        </button>

        {/* group items */}
        {isOpen && (
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out  
              ${isOpen ? "max-h-96 opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-1"}`}
          >
            <div className={`${collapsed ? "" : "pl-3"} flex flex-col gap-1.5 pt-2`}>
              {group.items.map((item) => (
                <SidebarLink key={item.to} item={item} isMobile={isMobile} />
              ))}
            </div>
          </div>

        )}
      </div>
    );
  };

  const SidebarContent = ({ isMobile = false }) => (
    <aside
      className={`
        h-screen bg-[var(--sidebar-bg)] border-r border-[var(--border)] flex flex-col
        transition-all duration-300
        ${collapsed && !isMobile ? "w-20" : "w-72"}
      `}
    >
      {/* Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-[var(--border)]">
        {!collapsed && (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-10 w-10 rounded-full bg-[var(--surface-2)] flex items-center justify-center shrink-0 overflow-hidden">
              {config.avatar ? (
                <img
                  src={config.avatar}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm font-bold text-[var(--muted-text)]">
                  {config.title?.[0] || "U"}
                </div>
              )}
            </div>

            <div className="leading-tight">
              <h1 className="text-sm font-extrabold text-[var(--text)] truncate">
                {config.title}
              </h1>
              <p className="text-xs text-[var(--muted-text)] truncate">
                {config.subtitle}
              </p>
            </div>
          </div>
        )}

        {/* Collapse toggle (desktop only) */}
        {!isMobile && (
          <button
            onClick={() => setCollapsed((p) => !p)}
            className="h-10 w-10 rounded-xl border border-[var(--border)] hover:bg-[var(--hover)] transition grid place-items-center shrink-0"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            type="button"
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5 text-[var(--text)]" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-[var(--text)]" />
            )}
          </button>
        )}

        {/* Close button (mobile only) */}
        {isMobile && (
          <button
            onClick={() => setMobileOpen(false)}
            className="h-10 w-10 rounded-xl border border-[var(--border)] hover:bg-[var(--hover)] transition grid place-items-center shrink-0"
            type="button"
          >
            <X className="h-5 w-5 text-[var(--text)]" />
          </button>
        )}
      </div>

      {/* Menu */}
      <div className="px-3 py-3 flex-1 overflow-y-auto">

        <nav className="flex flex-col gap-2">
          {config.items.map((item) => (
            <SidebarLink key={item.to} item={item} isMobile={isMobile} />
          ))}

          {config.groups?.length > 0 && (
            <div className="my-3 border-t border-[var(--border)]" />
          )}

          {config.groups?.length > 0 && (
            <div className="space-y-3">
              {config.groups.map((group) => (
                <SidebarGroup key={group.key} group={group} isMobile={isMobile} />
              ))}
            </div>
          )}
        </nav>

      </div>

      {/* Theme Toggle + Logout (bottom) */}
      <div className="p-3 border-t border-[var(--border)]">
        <div className={`flex ${collapsed ? "flex-col gap-4" : "flex-row"} gap-2`}>
          {/* Theme Toggle (smaller) */}
          <button
            onClick={toggleTheme}
            className="flex-[0.8] flex items-center justify-center gap-2 rounded-xl px-3 py-2 font-semibold border
            border-[var(--border)] bg-[var(--surface)] text-[var(--text)]hover:bg-[var(--hover)] transition"
            type="button"
            title={collapsed ? "Toggle Theme" : undefined}
          >
            {isDark ? <Sun className="h-5 w-5 shrink-0" /> : <Moon className="h-5 w-5 shrink-0" />}
            {!collapsed && (
              <span className="text-sm hidden xl:inline">
                {isDark ? "Light" : "Dark"}
              </span>
            )}
          </button>

          {/* Logout (bigger) */}
          <button
            onClick={config.logout}
            className="flex-[1.7] flex items-center justify-center gap-3 rounded-xl px-3 py-3 font-semibold
      border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition"
            type="button"
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </div>

    </aside>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-[var(--sidebar-bg)] border-b border-[var(--border)] z-40 flex items-center px-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="h-10 w-10 rounded-xl border border-[var(--border)] hover:bg-[var(--hover)] transition grid place-items-center"
          type="button"
        >
          <Menu className="h-5 w-5 text-[var(--text)]" />
        </button>

        <div className="ml-3 font-bold text-[var(--text)] truncate">{config.title}</div>
      </div>

      {/* Desktop fixed sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 h-screen z-30">
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
