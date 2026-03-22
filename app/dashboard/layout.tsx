"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { House, UserCog, ChevronDown, ShieldCheck, LucideIcon, LogOut } from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import ConfirmModal from "@/components/ConfirmModal";
import { showMessage } from "@/components/MessageModal";
import SessionTimeoutWrapper from "@/components/SessionTimeoutWrapper";
import SessionSync from "@/components/SessionSync";
import EditUserModal from "./admin/users/EditUserModal";
import ChangeUserPasswordModal from "./admin/users/ChangeUserPasswordModal";
import { getMyProfile, updateMyProfile, changeMyPassword, UserProfile } from "./actions";

// --- Reusable Dropdown Component ---
interface NavItem {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  className?: string;
}

function NavDropdown({ label, Icon, items, isOpen, onToggle }: {
  label: string;
  Icon: LucideIcon;
  items: NavItem[];
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 text-lg font-bold px-4 py-2 rounded hover:bg-white hover:text-blue-600 transition-colors"
      >
        <Icon size={20} /> {label}
        <ChevronDown className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <ul className="absolute right-0 mt-2 w-52 bg-white border rounded shadow-lg z-50 text-gray-800 py-1 overflow-hidden">
          {items.map((item, index) => (
            <li key={item.label} className={index === items.length - 1 && items.length > 2 ? "border-t border-gray-100" : ""}>
              <button
                onClick={item.onClick}
                className={`w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors flex items-center gap-2 ${item.className || ""}`}
              >
                {item.icon && <item.icon size={16} />}
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// --- Main Layout ---
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Store the initial user ID to detect session changes
  const initialUserId = useRef<string | null>(null);
  const initializationRef = useRef(false);

  useEffect(() => {
    if (!isPending && session?.user && !initializationRef.current) {
        initialUserId.current = session.user.id;
        initializationRef.current = true;
    }
  }, [session, isPending]);

  useEffect(() => {
    if (!isPending && session?.user) {
      const enforce = async () => {
        if ((session.user as any).active === false) {
          await showMessage("Your account is inactive. Please contact the administrator.");
          await signOut();
          router.push("/");
        }
      };
      enforce();
    }
  }, [session, isPending, router]);

  const toggleMenu = (name: string) => setOpenMenu(openMenu === name ? null : name);
  
  const openEditProfile = async () => {
    setOpenMenu(null);
    try {
      // Use the INITIAL user ID, not the potentially updated session ID
      const targetUserId = initialUserId.current;
      
      // Pass current session ID to verify we are still the same user
      const profile = await getMyProfile(targetUserId || undefined);
      if (profile) {
        setCurrentUserProfile(profile);
        setIsEditProfileOpen(true);
      } else {
        await showMessage("Failed to fetch profile");
      }
    } catch (error: unknown) {
      if (error instanceof Error && (error.message === "SessionMismatch" || error.message.includes("SessionMismatch"))) {
        await showMessage("Session changed in another tab. Reloading...");
        window.location.reload();
        return;
      }
      console.error("Error fetching profile:", error);
      await showMessage("Error fetching profile");
    }
  };

  const openChangePassword = async () => {
    setOpenMenu(null);
    try {
      // Use the INITIAL user ID
      const targetUserId = initialUserId.current;

      // Pass current session ID to verify we are still the same user
      const profile = await getMyProfile(targetUserId || undefined);
      if (profile) {
        setCurrentUserProfile(profile);
        setIsChangePasswordOpen(true);
      } else {
        await showMessage("Failed to fetch profile");
      }
    } catch (error: unknown) {
      if (error instanceof Error && (error.message === "SessionMismatch" || error.message.includes("SessionMismatch"))) {
        await showMessage("Session changed in another tab. Reloading...");
        window.location.reload();
        return;
      }
      console.error("Error fetching profile:", error);
      await showMessage("Error fetching profile");
    }
  };

  const handleEditProfileSubmit = async (data: {
    id: string;
    email: string;
    name: string;
    fullname: string;
    birthdate: string;
    gender: string;
  }) => {
    try {
      await updateMyProfile(data);
      setIsEditProfileOpen(false);
      router.refresh();
      await showMessage("Profile updated successfully.");
    } catch (error: unknown) {
      if (error instanceof Error && (error.message === "SessionMismatch" || error.message.includes("SessionMismatch"))) {
        await showMessage("Session changed in another tab. Reloading...");
        window.location.reload();
        return;
      }
      console.error("Error updating profile:", error);
      await showMessage("Failed to update profile");
    }
  };

  const handleChangePasswordSubmit = async (userId: string, newPassword: string) => {
    try {
        await changeMyPassword(userId, newPassword);
        setIsChangePasswordOpen(false);
        // Optional: Sign out the user or show success message?
        // For now, just close modal.
        await showMessage("Password changed successfully.");
    } catch (error: unknown) {
        if (error instanceof Error && (error.message === "SessionMismatch" || error.message.includes("SessionMismatch"))) {
            await showMessage("Session changed in another tab. Reloading...");
            window.location.reload();
            return;
        }
        console.error("Error changing password:", error);
        await showMessage("Failed to change password");
    }
  };

  const handleAction = async (action: string) => {
    setOpenMenu(null);
    if (action === "Role Management") {
      router.push("/dashboard/admin/roles");
      return;
    }
    if (action === "User Management") {
      router.push("/dashboard/admin/users");
      return;
    }
    if (action === "UOM Management") {
      router.push("/dashboard/admin/uom");
      return;
    }
    if (action === "Test Categories Management") {
      router.push("/dashboard/admin/test-categories");
      return;
    }
    if (action === "Medical Tests Management") {
      router.push("/dashboard/admin/medical-tests");
      return;
    }
    await showMessage(`Clicked: ${action}`);
  };

  const handleLogout = async () => {
    setOpenMenu(null);
    const confirmed = await ConfirmModal("Are you sure you want to logout?", {
      okText: "Yes, Logout",
      cancelText: "Cancel",
      okColor: "bg-red-600 hover:bg-red-700",
    });

    if (confirmed) {
      await signOut();
      router.push("/");
    }
  };

  const profileItems: NavItem[] = [
    { label: "Edit My Profile", onClick: openEditProfile },
    { label: "Change Password", onClick: openChangePassword },
  ];

  const adminItems = [
    { label: "User Management", onClick: () => handleAction("User Management") },
    { label: "Role Management", onClick: () => handleAction("Role Management") },
    { label: "UOM Management", onClick: () => handleAction("UOM Management") },
    { label: "Test Categories Management", onClick: () => handleAction("Test Categories Management") },
    { label: "Medical Tests Management", onClick: () => handleAction("Medical Tests Management") },
  ];

  const handleTimeoutLogout = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <SessionTimeoutWrapper
      timeoutMinutes={20}
      countdownSeconds={60}
      onLogout={handleTimeoutLogout}
    >
      <SessionSync />
      <div className="min-h-screen flex flex-col bg-slate-50/50">
        <header className="bg-slate-900 shadow-sm px-6 py-3 flex items-center justify-between text-white border-b border-slate-800">
          <button
            onClick={() => { router.push("/dashboard"); setOpenMenu(null); }}
            className="flex items-center gap-2 text-lg font-bold px-4 py-2 rounded hover:bg-slate-800 transition-colors"
          >
            <House size={20} className="text-indigo-400" /> Home
          </button>

          <div className="flex items-center gap-6">
            <NavDropdown 
              label="My Profile" Icon={UserCog} items={profileItems} 
              isOpen={openMenu === "profile"} onToggle={() => toggleMenu("profile")} 
            />
            <NavDropdown 
              label="Admin" Icon={ShieldCheck} items={adminItems} 
              isOpen={openMenu === "admin"} onToggle={() => toggleMenu("admin")} 
            />
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-lg font-bold px-4 py-2 rounded hover:bg-rose-600/10 hover:text-rose-500 text-slate-400 transition-colors ml-2 border border-slate-700 hover:border-rose-500/50"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>

        <footer className="bg-white text-slate-500 p-4 flex justify-between text-xs border-t border-slate-200">
          <span className="font-medium">
            {(() => {
              const rawName = session?.user?.name || session?.user?.email || "";
              const cleanName = rawName.replace(/ user$/i, "");
              return `System Operator: ${cleanName}`;
            })()}
          </span>
          <span>© {new Date().getFullYear()} Clinical Data Management System</span>
        </footer>

        {/* Edit Profile Modal */}
        <EditUserModal 
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          onEdit={handleEditProfileSubmit}
          user={currentUserProfile}
          title="Edit My Profile"
        />

        {/* Change Password Modal */}
        <ChangeUserPasswordModal 
          isOpen={isChangePasswordOpen}
          onClose={() => setIsChangePasswordOpen(false)}
          onChangePassword={handleChangePasswordSubmit}
          user={currentUserProfile}
          title="Change My Password"
        />
      </div>
    </SessionTimeoutWrapper>
  );
}
