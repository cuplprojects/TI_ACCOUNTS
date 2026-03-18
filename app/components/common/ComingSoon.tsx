"use client";

import React from "react";
import { usePageTitle } from "@/app/providers/PageTitleProvider";

interface ComingSoonProps {
  title: string;
  description?: string;
}

export default function ComingSoon({ title, description }: ComingSoonProps) {
  const { setTitle } = usePageTitle();

  React.useEffect(() => {
    setTitle(title);
  }, [title, setTitle]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4 bg-gray-bg">
      <div className="w-full max-w-md">
        {/* Main card */}
        <div className="bg-white rounded-2xl border border-gray-line p-8 md:p-12 shadow-sm">
          {/* Animated icon container */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-40 rounded-full blur-lg opacity-60"></div>
              <div className="relative w-20 h-20 md:w-24 md:h-24 bg-blue-40 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 md:w-12 md:h-12 text-blue-00"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="text-center">
            <h2 className="display-3 text-blue-00 mb-3">{title}</h2>
            <p className="body text-gray-50 mb-8">
              {description || "We're working hard to bring this feature to you soon."}
            </p>

            {/* Feature highlights */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-30">
                <svg className="w-4 h-4 text-green-10 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Launching soon</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-30">
                <svg className="w-4 h-4 text-green-10 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Packed with features</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-30">
                <svg className="w-4 h-4 text-green-10 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Worth the wait</span>
              </div>
            </div>

            {/* CTA Button */}
            <button className="w-full px-6 py-3 bg-blue-00 text-white rounded-lg small-semibold hover:bg-blue-10 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg">
              <span className="flex items-center justify-center gap-2">
                <span>🚀</span>
                <span>Notify Me</span>
              </span>
            </button>

            {/* Footer text */}
            <p className="text-xs text-black-90 mt-6">
              Check back soon for updates
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
