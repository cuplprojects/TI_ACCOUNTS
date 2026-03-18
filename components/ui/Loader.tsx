"use client";

import React from "react";
import Image from "next/image";

interface LoaderProps {
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({ text = "Loading..." }) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative w-24 h-24 animate-pulse">
          <Image
            src="/images/common/logo.png"
            alt="Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        <div className="text-primary title-4-semibold">{text}</div>
        <div className="w-48 h-1 bg-gray-line rounded-full overflow-hidden">
          <div className="h-full bg-primary animate-[loading_2s_ease-in-out_infinite]"></div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
