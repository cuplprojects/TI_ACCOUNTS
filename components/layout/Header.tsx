"use client";

import React, { useState, useEffect } from "react";
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
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { usePageTitle } from "@/providers/PageTitleProvider";
import { useAuth } from "@/providers/AuthProvider";
import { Avatar } from "@/components/common/Avatar";
import sidebarConfig from "@/constants/sidebar.json";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("Sales");
  const [currentDateTime, setCurrentDateTime] = useState("");

  // Set active tab based on current pathname
  useEffect(() => {
    const navItems = sidebarConfig.navigation;
    const activeItem = navItems.find(
      (item) => pathname === item.path || pathname.startsWith(`${item.path}/`)
    );
    if (activeItem) {
      setSelectedTab(activeItem.title);
    }
  }, [pathname]);

  // Update date and time every second
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const date = now.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      const time = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      setCurrentDateTime(`${date} ${time}`);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogout = async () => {
    try {
      logout();
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/login");
    }
  };

  const handleTabChange = (tabTitle: string) => {
    const navItems = sidebarConfig.navigation;
    const selectedItem = navItems.find((item) => item.title === tabTitle);
    if (selectedItem) {
      setSelectedTab(tabTitle);
      router.push(selectedItem.path);
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
    <header className={cn("w-full bg-white border-b border-gray-200", className)}>
      <div className="py-3 px-4 md:px-6">
        {/* Top Row - Logo, Search, Tabs, DateTime, User */}
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuClick}
              className="md:hidden flex-shrink-0 p-2 rounded-md hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors"
              title="Toggle menu"
            >
              <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
            </button>

            <div className="flex-shrink-0">
              <Image
                src="/images/common/logo.png"
                alt="Totally Indian"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </div>
          </div>

          {/* Center - Search Bar */}
          <div className="flex-1 max-w-2xl">
            <div className="relative flex items-center border-2 border-blue-900 rounded-lg overflow-hidden shadow-sm">
              <input
                type="text"
                placeholder="Search for Invoice Number/Shipping Bill Number/EGM Number...."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 h-10 bg-white px-4 text-sm text-gray-700 focus:outline-none placeholder:text-gray-400"
              />
              <button className="flex h-10 w-12 items-center justify-center bg-blue-900 text-white hover:bg-blue-950 transition-colors">
                <FontAwesomeIcon icon={faSearch} className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            {/* Tab Selector */}
            <div className="flex-shrink-0 relative inline-block w-auto">
              <select
                value={selectedTab}
                onChange={(e) => handleTabChange(e.target.value)}
                className="px-4 py-2 pr-8 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-500 focus:outline-none cursor-pointer appearance-none"
              >
                {sidebarConfig.navigation.map((item) => (
                  <option key={item.path} value={item.title} className="bg-white text-gray-900">
                    {item.title} {`>`}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-white">
                <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>

            {/* Current Date & Time */}
            <div className="flex-shrink-0 bg-blue-800 text-white px-4 py-2 rounded text-sm font-medium whitespace-nowrap">
              {currentDateTime}
            </div>

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
                      className={`font-medium text-xs xs:text-sm text-gray-900 truncate`}
                      title={user?.name || ""}
                    >
                      {user?.name || ""}
                    </span>
                    <span className="text-xs text-gray-500 truncate">User</span>
                  </div>
                  <button className="ml-0 xs:ml-1 flex-shrink-0">
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className={`h-3 w-3 text-gray-500 transition-transform duration-200 ${
                        showDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 top-12 w-56 xs:w-60 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-3 xs:p-4 border-b border-gray-200">
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
                            className={`text-xs text-gray-500 truncate`}
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
                          className="flex items-center px-3 xs:px-4 py-2 text-xs xs:text-sm text-gray-900 hover:bg-gray-100"
                        >
                          <FontAwesomeIcon
                            icon={faUser}
                            className="w-4 h-4 mr-2 xs:mr-3 text-gray-500 flex-shrink-0"
                          />
                          <span className="truncate">Profile</span>
                        </Link>
                      </li>

                      <li>
                        <Link
                          href={getChangePasswordLink()}
                          className="flex items-center px-3 xs:px-4 py-2 text-xs xs:text-sm text-gray-900 hover:bg-gray-100"
                        >
                          <FontAwesomeIcon
                            icon={faKey}
                            className="w-4 h-4 mr-2 xs:mr-3 text-gray-500 flex-shrink-0"
                          />
                          <span className="truncate">Change Password</span>
                        </Link>
                      </li>
                    </ul>
                    <div className="border-t border-gray-200 py-2">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center px-3 xs:px-4 py-2 text-xs xs:text-sm text-red-600 hover:bg-gray-100"
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
      </div>
    </header>
  );
}
