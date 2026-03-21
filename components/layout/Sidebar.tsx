"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import sidebarConfig from "@/constants/sidebar.json";

// Helper function to check if an icon name is a predefined icon or an image path
const isImagePath = (iconName: string): boolean => {
  return (
    iconName.includes("/") ||
    iconName.endsWith(".png") ||
    iconName.endsWith(".jpg") ||
    iconName.endsWith(".jpeg") ||
    iconName.endsWith(".svg") ||
    iconName.endsWith(".webp")
  );
};

// Renders either an SVG icon from the predefined set or an image from a path
const renderIcon = (iconName: string, isActive: boolean): React.ReactNode => {
  if (isImagePath(iconName)) {
    const activeFilter =
      "brightness(0) saturate(100%) invert(100%) sepia(19%) saturate(305%) hue-rotate(314deg) brightness(102%) contrast(101%)";
    const inactiveFilter =
      "brightness(0) saturate(100%) invert(42%) sepia(9%) saturate(111%) hue-rotate(169deg) brightness(94%) contrast(87%)";

    return (
      <div className="flex items-center justify-center overflow-hidden">
        <Image
          src={iconName}
          alt="Menu icon"
          width={16}
          height={16}
          className="object-contain"
          style={{
            filter: isActive ? activeFilter : inactiveFilter,
            transition: "filter 0.2s ease-in-out",
          }}
        />
      </div>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke={isActive ? "#FFF7F0" : "#6B6B6A"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M9 9h6" />
      <path d="M9 13h6" />
      <path d="M9 17h6" />
    </svg>
  );
};

interface SidebarProps {
  className?: string;
  onNavClick?: () => void;
}

export default function Sidebar({ className, onNavClick }: SidebarProps) {
  const pathname = usePathname();

  const navItems = sidebarConfig.navigation;

  return (
    <aside
      className={cn(
        "flex flex-col w-[200px] bg-white min-h-screen border-r border-gray-line",
        className
      )}
    >
      <div className="p-3 xs:p-4">
        <Link href="/" className="flex items-center justify-center">
          <Image
            src="/images/common/logo.png"
            alt="Totally Indian"
            width={100}
            height={100}
          />
        </Link>
      </div>

      <nav className="flex-1 py-2 px-2 xs:px-3">
        <ul className="space-y-1">
          {/* Top Level Navigation */}
          {navItems.map((item, index) => {
            const fullPath = item.path;
            const isActive =
              pathname === fullPath || pathname.startsWith(`${fullPath}/`);

            return (
              <li key={`top-${index}`}>
                {item.topLevel === true && (
                  <Link
                    href={fullPath}
                    onClick={onNavClick}
                    className={cn(
                      "flex items-center px-2 xs:px-3 py-2 rounded-md text-xs xs:text-sm font-medium transition-colors whitespace-nowrap",
                      isActive
                        ? "bg-blue-900 text-white"
                        : "text-gray-10 hover:bg-blue-900 hover:text-white"
                    )}
                    onMouseEnter={(e) => {
                      const imgElement = e.currentTarget.querySelector("img");
                      if (imgElement) {
                        imgElement.style.filter =
                          "brightness(0) saturate(100%) invert(100%) sepia(19%) saturate(305%) hue-rotate(314deg) brightness(102%) contrast(101%)";
                      }

                      const svgElement = e.currentTarget.querySelector("svg");
                      if (svgElement) {
                        svgElement.setAttribute("stroke", "#FFF7F0");
                      }

                      e.currentTarget.classList.add("bg-primary", "text-light");
                      e.currentTarget.classList.remove("text-muted");
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        const imgElement = e.currentTarget.querySelector("img");
                        if (imgElement) {
                          imgElement.style.filter =
                            "brightness(0) saturate(100%) invert(42%) sepia(9%) saturate(111%) hue-rotate(169deg) brightness(94%) contrast(87%)";
                        }

                        const svgElement = e.currentTarget.querySelector("svg");
                        if (svgElement) {
                          svgElement.setAttribute("stroke", "#6B6B6A");
                        }

                        e.currentTarget.classList.remove(
                          "bg-primary",
                          "text-light"
                        );
                        e.currentTarget.classList.add("text-muted");
                      }
                    }}
                  >
                    <span className="mr-2 xs:mr-3 flex-shrink-0">
                      {renderIcon(item.icon, isActive)}
                    </span>
                    <span className="truncate">{item.title}</span>
                    {(item as any).badge && (
                      <span className="ml-auto px-1.5 xs:px-2 py-0.5 rounded text-xs flex-shrink-0">
                        ({(item as any).badge})
                      </span>
                    )}
                  </Link>
                )}
              </li>
            );
          })}

          {/* break line */}
          <li className="py-3 xs:py-4">
            <div className="w-full h-[1px] bg-gray-line"></div>
          </li>

          {/* Bottom Level Navigation */}
          {navItems.map((item, index) => {
            const fullPath = item.path;
            const isActive =
              pathname === fullPath || pathname.startsWith(`${fullPath}/`);

            return (
              <li key={`bottom-${index}`}>
                {item.topLevel === false && (
                  <Link
                    href={fullPath}
                    onClick={onNavClick}
                    className={cn(
                      "flex items-center px-2 xs:px-3 py-2 rounded-md text-xs xs:text-sm font-medium transition-colors whitespace-nowrap",
                      isActive
                        ? "bg-blue-900 text-white"
                        : "text-gray-10 hover:bg-blue-900 hover:text-white"
                    )}
                    onMouseEnter={(e) => {
                      const imgElement = e.currentTarget.querySelector("img");
                      if (imgElement) {
                        imgElement.style.filter =
                          "brightness(0) saturate(100%) invert(100%) sepia(19%) saturate(305%) hue-rotate(314deg) brightness(102%) contrast(101%)";
                      }

                      const svgElement = e.currentTarget.querySelector("svg");
                      if (svgElement) {
                        svgElement.setAttribute("stroke", "#FFF7F0");
                      }

                      e.currentTarget.classList.add("bg-primary", "text-light");
                      e.currentTarget.classList.remove("text-muted");
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        const imgElement = e.currentTarget.querySelector("img");
                        if (imgElement) {
                          imgElement.style.filter =
                            "brightness(0) saturate(100%) invert(42%) sepia(9%) saturate(111%) hue-rotate(169deg) brightness(94%) contrast(87%)";
                        }

                        const svgElement = e.currentTarget.querySelector("svg");
                        if (svgElement) {
                          svgElement.setAttribute("stroke", "#6B6B6A");
                        }

                        e.currentTarget.classList.remove(
                          "bg-primary",
                          "text-light"
                        );
                        e.currentTarget.classList.add("text-muted");
                      }
                    }}
                  >
                    <span className="mr-2 xs:mr-3 flex-shrink-0">
                      {renderIcon(item.icon, isActive)}
                    </span>
                    <span className="truncate">{item.title}</span>
                    {(item as any).badge && (
                      <span className="ml-auto px-1.5 xs:px-2 py-0.5 rounded text-xs flex-shrink-0">
                        ({(item as any).badge})
                      </span>
                    )}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
