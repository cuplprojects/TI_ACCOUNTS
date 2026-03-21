"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faUser,
  faKey,
  faSignOutAlt,
  faBars,
} from "@fortawesome/free-solid-svg-icons";
import { usePageTitle } from "@/providers/PageTitleProvider";
import { useAuth } from "@/providers/AuthProvider";
import { Avatar } from "@/components/common/Avatar";

interface HeaderProps {
  className?: string;
  onMenuClick?: () => void;
}

export default function Header({ className, onMenuClick }: HeaderProps) {
  const { title } = usePageTitle();
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = useState(false);

  // Accounts tabs
  const accountsTabs = [
    { name: "Sales", path: "/sales" },
    { name: "Purchases", path: "/purchases" }
  ];

  const isAccountsPage = pathname.includes("sales") || pathname.includes("purchases");

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogout = async () => {
    try {
      logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/login");
    }
  };

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

  const getChangePasswordLink = () => {
    return "/settings/change-password";
  };

  return (
    <>
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
                      User
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
                      <li>
                        <Link
                          href="/settings"
                          className="flex items-center px-3 xs:px-4 py-2 text-xs xs:text-sm text-default hover:bg-gray-bg"
                        >
                          <FontAwesomeIcon
                            icon={faUser}
                            className="w-4 h-4 mr-2 xs:mr-3 text-muted flex-shrink-0"
                          />
                          <span className="truncate">Profile</span>
                        </Link>
                      </li>

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

      {/* Accounts Tabs - shown only on accounts pages */}
      {isAccountsPage && (
        <div className="bg-white border-b border-gray-200">
          <div className="flex space-x-8 px-4 md:px-6">
            {accountsTabs.map((tab) => {
              const isActive = pathname.includes(tab.path);
              return (
                <Link
                  key={tab.path}
                  href={tab.path}
                  className={cn(
                    "py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                    isActive
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                  )}
                >
                  {tab.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
