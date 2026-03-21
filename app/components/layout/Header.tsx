"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/app/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faUser,
  faKey,
  faSignOutAlt,
  faBars,
} from "@fortawesome/free-solid-svg-icons";
import { usePageTitle } from "@/app/providers/PageTitleProvider";
import { logout } from "@/app/lib/services/admin/authService";
import { sellerLogout } from "@/app/lib/services/seller/authService";
import { useAuth } from "@/app/providers/AuthProvider";
import { Avatar } from "@/app/components/common/Avatar";

interface HeaderProps {
  className?: string;
  onMenuClick?: () => void;
}

export default function Header({ className, onMenuClick }: HeaderProps) {
  const { title } = usePageTitle();
  const { user, logout: authLogout } = useAuth();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogout = async () => {
    try {
      // Call the appropriate logout function based on user role
      if (user?.role === "seller") {
        await sellerLogout();
      } else {
        logout(); // Admin logout (synchronous)
      }

      // Also call the context logout to clear user state
      authLogout();

      // Redirect to login page
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout fails, clear local state and redirect
      authLogout();
      router.push("/login");
    }
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById("user-dropdown");
      if (dropdown && !dropdown.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // CSS class for truncated text with tooltip
  const truncateWithTooltip = "truncate hover:cursor-help";

  // Get the appropriate change password link based on user role
  const getChangePasswordLink = () => {
    return user?.role === "seller"
      ? "/seller/settings/change-password"
      : "/profile/change-password";
  };

  return (
    <header className={cn("w-full h-16 bg-white border-b border-gray-line", className)}>
      <div className="h-full py-3 flex items-center justify-between px-2 xs:px-3 sm:px-4 md:px-6">
        <div className="flex items-center flex-1 gap-2 xs:gap-3 min-w-0">
          {/* Mobile menu button - shown on md and below */}
          <button
            onClick={onMenuClick}
            className="md:hidden flex-shrink-0 p-2 rounded-md hover:bg-gray-bg text-gray-10 hover:text-blue-00 transition-colors"
            title="Toggle menu"
          >
            <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
          </button>
          <h1 className="display-4-bold text-blue-00 truncate text-base sm:text-lg md:text-xl lg:text-2xl">{title}</h1>
        </div>

        <div className="flex items-center gap-2 xs:gap-3 sm:gap-5 flex-shrink-0">
          {/* Chat */}
          <button
            className="p-2 rounded-full hover:bg-gray-bg text-gray-10 hover:text-blue-00 transition-colors"
            onClick={() => router.push("/seller/chats")}
            title="Chat"
          >
            <Image
              src="/images/common/header/chat.png"
              alt="Chat"
              width={18}
              height={18}
            />
          </button>

          {/* User Profile */}
          <div className="flex items-center relative">
            <div id="user-dropdown" className="flex items-center gap-2">
              <div
                onClick={toggleDropdown}
                className="cursor-pointer flex items-center gap-1 xs:gap-2 select-none"
              >
                <Avatar
                  name={user?.name || "User"}
                  className="h-8 w-8 xs:h-10 xs:w-10 text-xs xs:text-sm flex-shrink-0"
                />
                <div className="hidden sm:flex flex-col max-w-[100px] xs:max-w-[120px] min-w-0">
                  <span
                    className={`font-medium text-xs xs:text-sm text-default truncate`}
                    title={user?.name || ""}
                  >
                    {user?.name || ""}
                  </span>
                  <span className="text-xs text-muted truncate">
                    {user?.role === "admin" ? "Admin" : "Seller"}
                  </span>
                </div>
                <button className="ml-0 xs:ml-1 flex-shrink-0">
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`h-3 w-3 text-muted transition-transform duration-200 ${
                      showDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 top-12 w-56 xs:w-60 bg-white rounded-lg shadow-lg border border-secondary z-50">
                  <div className="p-3 xs:p-4 border-b border-secondary">
                    <div className="flex items-center gap-2 xs:gap-3">
                      <div className="flex-shrink-0">
                        <Avatar
                          name={user?.name || "User"}
                          className="h-8 w-8 xs:h-10 xs:w-10 text-xs xs:text-sm"
                        />
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <p
                          className={`font-medium text-xs xs:text-sm truncate`}
                          title={user?.name || ""}
                        >
                          {user?.name || ""}
                        </p>
                        <p
                          className={`text-xs text-muted truncate`}
                          title={user?.email || ""}
                        >
                          {user?.email || ""}
                        </p>
                      </div>
                    </div>
                  </div>
                  <ul className="py-2">
                    {user?.role === "seller" && (
                      <li>
                        <Link
                          href="/seller/settings"
                          className="flex items-center px-3 xs:px-4 py-2 text-xs xs:text-sm text-default hover:bg-gray-bg"
                        >
                          <FontAwesomeIcon
                            icon={faUser}
                            className="w-4 h-4 mr-2 xs:mr-3 text-muted flex-shrink-0"
                          />
                          <span className="truncate">Profile</span>
                        </Link>
                      </li>
                    )}

                    <li>
                      <Link
                        href={getChangePasswordLink()}
                        className="flex items-center px-3 xs:px-4 py-2 text-xs xs:text-sm text-default hover:bg-gray-bg"
                      >
                        <FontAwesomeIcon
                          icon={faKey}
                          className="w-4 h-4 mr-2 xs:mr-3 text-muted flex-shrink-0"
                        />
                        <span className="truncate">Change Password</span>
                      </Link>
                    </li>
                  </ul>
                  <div className="border-t border-secondary py-2">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center px-3 xs:px-4 py-2 text-xs xs:text-sm text-red-600 hover:bg-gray-bg"
                    >
                      <FontAwesomeIcon
                        icon={faSignOutAlt}
                        className="w-4 h-4 mr-2 xs:mr-3 flex-shrink-0"
                      />
                      <span className="truncate">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
