import {
  BriefcaseBusiness,
  Camera,
  FileText,
  FolderKanban,
  GraduationCap,
  Image,
  Images,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Settings,
  Sparkles,
  Tags,
  UserRound,
  X,
} from "lucide-react";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import ProfileManager from "./ProfileManager";
import ResumeManager from "./ResumeManager";
import ProjectManager from "./ProjectManager";
import SkillManager from "./SkillManager";
import EducationManager from "./EducationManager";
import ExperienceManager from "./ExperienceManager";
import DocumentManager from "./DocumentManager";
import BeyondSettingsManager from "./BeyondSettingsManager";
import GalleryCategoryManager from "./GalleryCategoryManager";
import GalleryManager from "./GalleryManager";
import MessageManager from "./MessageManager";
import SettingsManager from "./SettingsManager";

function AdminDashboard() {
  const navigate = useNavigate();

  const {
    user,
    logout,
  } = useAuth();

  const [
    activeSection,
    setActiveSection,
  ] = useState(
    "Dashboard"
  );

  const [
    mobileSidebarOpen,
    setMobileSidebarOpen,
  ] = useState(false);

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Profile",
      icon: UserRound,
    },
    {
      name: "Resume",
      icon: FileText,
    },
    {
      name: "Projects",
      icon: FolderKanban,
    },
    {
      name: "Skills",
      icon: Sparkles,
    },
    {
      name: "Education",
      icon: GraduationCap,
    },
    {
      name: "Experience",
      icon: BriefcaseBusiness,
    },
    {
      name: "Documents",
      icon: Image,
    },
    {
      name: "Beyond Settings",
      icon: Camera,
    },
    {
      name: "Gallery Categories",
      icon: Tags,
    },
    {
      name: "Gallery",
      icon: Images,
    },
    {
      name: "Messages",
      icon: Mail,
    },
    {
      name: "Settings",
      icon: Settings,
    },
  ];

  function handleSectionChange(
    section
  ) {
    setActiveSection(
      section
    );

    setMobileSidebarOpen(
      false
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleLogout() {
    setMobileSidebarOpen(
      false
    );

    const { error } =
      await logout();

    if (error) {
      console.error(
        "Logout failed:",
        error.message
      );

      return;
    }

    navigate(
      "/admin",
      {
        replace: true,
      }
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] text-white">

      {/* Mobile Header */}

      <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-white/10 bg-[#090c1b]/95 px-5 backdrop-blur-xl lg:hidden">

        <div>

          <h1 className="gradient-text text-xl font-bold">
            Prince.
          </h1>

          <p className="mt-0.5 text-[11px] text-gray-500">
            Portfolio Admin
          </p>

        </div>

        <button
          type="button"
          onClick={() =>
            setMobileSidebarOpen(
              true
            )
          }
          aria-label="Open admin navigation"
          aria-expanded={
            mobileSidebarOpen
          }
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-300 transition hover:border-purple-500/30 hover:bg-purple-500/10 hover:text-purple-300"
        >
          <Menu size={22} />
        </button>

      </header>

      {/* Mobile Overlay */}

      <div
        onClick={() =>
          setMobileSidebarOpen(
            false
          )
        }
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          mobileSidebarOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* Mobile Sidebar */}

      <aside
        className={`fixed bottom-0 left-0 top-0 z-50 flex w-[280px] max-w-[85vw] flex-col border-r border-white/10 bg-[#090c1b] p-6 shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
          mobileSidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >

        <div className="mb-8 flex items-start justify-between gap-4">

          <div>

            <h1 className="gradient-text text-2xl font-bold">
              Prince.
            </h1>

            <p className="mt-1 text-xs text-gray-500">
              Portfolio Admin
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              setMobileSidebarOpen(
                false
              )
            }
            aria-label="Close admin navigation"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-300 transition hover:border-purple-500/30 hover:text-purple-300"
          >
            <X size={19} />
          </button>

        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto pr-1">

          {menuItems.map(
            (item) => {
              const Icon =
                item.icon;

              const isActive =
                activeSection ===
                item.name;

              return (
                <button
                  key={
                    item.name
                  }
                  type="button"
                  onClick={() =>
                    handleSectionChange(
                      item.name
                    )
                  }
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition duration-200 ${
                    isActive
                      ? "bg-purple-500/15 text-purple-300"
                      : "text-gray-400 hover:bg-purple-500/10 hover:text-purple-300"
                  }`}
                >
                  <Icon
                    size={19}
                  />

                  <span>
                    {item.name}
                  </span>
                </button>
              );
            }
          )}

        </nav>

        <div className="mt-6 border-t border-white/10 pt-5">

          <p className="mb-1 text-xs text-gray-600">
            Signed in as
          </p>

          <p className="mb-4 truncate text-sm text-gray-400">
            {user?.email}
          </p>

          <button
            type="button"
            onClick={
              handleLogout
            }
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-red-400 transition hover:bg-red-500/10"
          >
            <LogOut
              size={19}
            />

            Logout
          </button>

        </div>

      </aside>

      <div className="flex min-h-[calc(100vh-72px)] lg:min-h-screen">

        {/* Desktop Sidebar */}

        <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-[#090c1b] p-6 lg:flex lg:min-h-screen lg:flex-col">

          <div className="mb-10">

            <h1 className="gradient-text text-2xl font-bold">
              Prince.
            </h1>

            <p className="mt-1 text-xs text-gray-500">
              Portfolio Admin
            </p>

          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto pr-1">

            {menuItems.map(
              (item) => {
                const Icon =
                  item.icon;

                const isActive =
                  activeSection ===
                    item.name;

                return (
                  <button
                    key={
                      item.name
                    }
                    type="button"
                    onClick={() =>
                      handleSectionChange(
                        item.name
                      )
                    }
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition duration-200 ${
                      isActive
                        ? "bg-purple-500/15 text-purple-300"
                        : "text-gray-400 hover:bg-purple-500/10 hover:text-purple-300"
                    }`}
                  >
                    <Icon
                      size={19}
                    />

                    <span>
                      {item.name}
                    </span>

                  </button>
                );
              }
            )}

          </nav>

          <div className="mt-8 border-t border-white/10 pt-6">

            <p className="mb-1 text-xs text-gray-600">
              Signed in as
            </p>

            <p className="mb-5 truncate text-sm text-gray-400">
              {user?.email}
            </p>

            <button
              type="button"
              onClick={
                handleLogout
              }
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-red-400 transition duration-200 hover:bg-red-500/10"
            >
              <LogOut
                size={19}
              />

              Logout
            </button>

          </div>

        </aside>

        {/* Main Content */}

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-10">

          <div className="mx-auto max-w-7xl">

            {activeSection ===
              "Dashboard" && (
              <DashboardHome
                user={user}
                setActiveSection={
                  handleSectionChange
                }
              />
            )}

            {activeSection ===
              "Profile" && (
              <ProfileManager />
            )}

            {activeSection ===
              "Resume" && (
              <ResumeManager />
            )}

            {activeSection ===
              "Projects" && (
              <ProjectManager />
            )}

            {activeSection ===
              "Skills" && (
              <SkillManager />
            )}

            {activeSection ===
              "Education" && (
              <EducationManager />
            )}

            {activeSection ===
              "Experience" && (
              <ExperienceManager />
            )}

            {activeSection ===
              "Documents" && (
              <DocumentManager />
            )}

            {activeSection ===
              "Beyond Settings" && (
              <BeyondSettingsManager />
            )}

            {activeSection ===
              "Gallery Categories" && (
              <GalleryCategoryManager />
            )}

            {activeSection ===
              "Gallery" && (
              <GalleryManager />
            )}

            {activeSection ===
              "Messages" && (
              <MessageManager />
            )}

            {activeSection ===
              "Settings" && (
              <SettingsManager />
            )}

          </div>

        </main>

      </div>

    </div>
  );
}

function DashboardHome({
  user,
  setActiveSection,
}) {
  return (
    <>

      <div className="mb-10">

        <p className="text-sm font-medium text-purple-400">
          Dashboard
        </p>

        <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
          Welcome back
        </h2>

        <p className="mt-3 text-gray-500">
          Manage your portfolio content from here.
        </p>

        {user?.email && (
          <p className="mt-2 text-sm text-gray-600">

            Signed in as{" "}

            <span className="text-purple-400">
              {user.email}
            </span>

          </p>
        )}

      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

        <DashboardCard
          title="Projects"
          value="Manage"
          description="Portfolio projects"
          icon={
            FolderKanban
          }
        />

        <DashboardCard
          title="Skills"
          value="Manage"
          description="Portfolio skills"
          icon={
            Sparkles
          }
        />

        <DashboardCard
          title="Documents"
          value="Manage"
          description="Certificates and documents"
          icon={Image}
        />

        <DashboardCard
          title="Gallery"
          value="Manage"
          description="Beyond the Code photos"
          icon={Images}
        />

      </div>

      <div className="mt-8">

        <h3 className="mb-5 text-xl font-semibold">
          Quick Actions
        </h3>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

          <QuickAction
            title="Edit Profile"
            description="Update your name, profile image, headline, bio and social links."
            icon={UserRound}
            onClick={() =>
              setActiveSection(
                "Profile"
              )
            }
          />

          <QuickAction
            title="Upload Resume"
            description="Upload or replace the resume available on your portfolio."
            icon={FileText}
            onClick={() =>
              setActiveSection(
                "Resume"
              )
            }
          />

          <QuickAction
            title="Add Project"
            description="Add software engineering, AI/ML or research projects."
            icon={
              FolderKanban
            }
            onClick={() =>
              setActiveSection(
                "Projects"
              )
            }
          />

          <QuickAction
            title="View Messages"
            description="Read messages sent through the public contact form."
            icon={Mail}
            onClick={() =>
              setActiveSection(
                "Messages"
              )
            }
          />

        </div>

      </div>

      <div className="mt-8">

        <h3 className="mb-5 text-xl font-semibold">
          Content Management
        </h3>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

          <QuickAction
            title="Manage Skills"
            description="Add or update technologies, frameworks and technical skills."
            icon={Sparkles}
            onClick={() =>
              setActiveSection(
                "Skills"
              )
            }
          />

          <QuickAction
            title="Manage Education"
            description="Add or update your academic qualifications and results."
            icon={
              GraduationCap
            }
            onClick={() =>
              setActiveSection(
                "Education"
              )
            }
          />

          <QuickAction
            title="Manage Experience"
            description="Add professional, technical and research experience."
            icon={
              BriefcaseBusiness
            }
            onClick={() =>
              setActiveSection(
                "Experience"
              )
            }
          />

          <QuickAction
            title="Manage Documents"
            description="Upload certificates, reports, publications and other files."
            icon={Image}
            onClick={() =>
              setActiveSection(
                "Documents"
              )
            }
          />

        </div>

      </div>

      <div className="mt-8">

        <div className="mb-5">

          <p className="text-sm font-medium text-purple-400">
            Beyond the Code
          </p>

          <h3 className="mt-1 text-xl font-semibold">
            Gallery Management
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Manage the content displayed in your public
            Beyond the Code section and gallery.
          </p>

        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">

          <QuickAction
            title="Beyond Settings"
            description="Manage your Beyond the Code title, introduction and gallery description."
            icon={Camera}
            onClick={() =>
              setActiveSection(
                "Beyond Settings"
              )
            }
          />

          <QuickAction
            title="Gallery Categories"
            description="Create, edit, order and hide gallery categories."
            icon={Tags}
            onClick={() =>
              setActiveSection(
                "Gallery Categories"
              )
            }
          />

          <QuickAction
            title="Manage Gallery"
            description="Upload, edit, publish and feature photos."
            icon={Images}
            onClick={() =>
              setActiveSection(
                "Gallery"
              )
            }
          />

        </div>

      </div>

      <div className="glass-card mt-8 rounded-3xl p-6 sm:p-8">

        <div className="flex items-start gap-4">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">

            <LayoutDashboard
              size={22}
            />

          </div>

          <div>

            <h3 className="text-xl font-semibold">
              Portfolio Management
            </h3>

            <p className="mt-3 max-w-3xl leading-7 text-gray-400">
              Your admin dashboard allows you to manage the
              content displayed on your public portfolio.
              Changes saved through the dashboard are stored
              in Supabase and displayed dynamically on the
              website. Messages submitted from your contact
              form are also available directly from this
              dashboard.
            </p>

          </div>

        </div>

      </div>

    </>
  );
}

function DashboardCard({
  title,
  value,
  description,
  icon: Icon,
}) {
  return (
    <div className="glass-card group rounded-2xl p-6 transition duration-300 hover:-translate-y-1 hover:border-purple-500/30">

      <div className="mb-5 flex items-center justify-between">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">

          <Icon size={21} />

        </div>

      </div>

      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold text-white">
        {value}
      </p>

      <p className="mt-2 text-xs text-gray-500">
        {description}
      </p>

    </div>
  );
}

function QuickAction({
  title,
  description,
  icon: Icon,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="glass-card group rounded-2xl p-6 text-left transition duration-300 hover:-translate-y-1 hover:border-purple-500/30"
    >

      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 transition group-hover:bg-purple-500/20">

        <Icon size={21} />

      </div>

      <h4 className="font-semibold text-white">
        {title}
      </h4>

      <p className="mt-2 text-sm leading-6 text-gray-500">
        {description}
      </p>

    </button>
  );
}

export default AdminDashboard;