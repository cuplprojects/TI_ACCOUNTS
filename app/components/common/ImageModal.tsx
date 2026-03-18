'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

interface ImageModalProps {
  isOpen: boolean;
  imageUrl: string;
  fileName: string;
  onClose: () => void;
}

export default function ImageModal({
  isOpen,
  imageUrl,
  fileName,
  onClose,
}: ImageModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 
           bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-md transition-colors bg-white z-10"
          title="Close"
        >
          <FontAwesomeIcon
            icon={faTimes}
            className="h-5 w-5 text-gray-600 hover:text-gray-900"
          />
        </button>

        {/* Image Container - Full Size */}
        <img
          src={imageUrl}
          alt={fileName}
          className="max-w-full max-h-[90vh] object-contain"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const errorDiv = document.createElement('div');
            errorDiv.className =
              'flex items-center justify-center w-full h-96 bg-gray-100 rounded';
            errorDiv.innerHTML =
              '<p class="text-gray-500">Failed to load image</p>';
            e.currentTarget.parentElement?.appendChild(errorDiv);
          }}
        />
      </div>
    </div>
  );
}
