"use client";

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faChevronDown,
  faFolder,
} from "@fortawesome/free-solid-svg-icons";

interface FolderTreeProps {
  folders: FolderNode[];
  selectedFolder: string;
  onSelectFolder: (folder: string) => void;
}

interface FolderNode {
  name: string;
  path: string;
  children: FolderNode[];
}

export default function FolderTree({
  folders,
  selectedFolder,
  onSelectFolder,
}: FolderTreeProps) {
  // Initialize with files/ folder expanded by default
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(['files/']),
  );

  const toggleFolderExpansion = (folderPath: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath);
    } else {
      newExpanded.add(folderPath);
    }
    setExpandedFolders(newExpanded);
  };

  const renderFolderNode = (node: FolderNode, level: number = 0): React.ReactNode => {
    // Safety check - ensure node is valid
    if (!node || typeof node !== 'object' || !node.path) {
      return null;
    }

    const isExpanded = expandedFolders.has(node.path);
    const isSelected = selectedFolder === node.path;
    const hasChildren = Array.isArray(node.children) && node.children.length > 0;

    const handleFolderClick = () => {
      // Only select leaf folders (folders without children)
      if (!hasChildren) {
        onSelectFolder(node.path);
      } else {
        // For parent folders, just toggle expansion without selecting
        toggleFolderExpansion(node.path);
      }
    };

    const handleChevronClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      toggleFolderExpansion(node.path);
    };

    return (
      <>
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm cursor-pointer transition ${
            isSelected
              ? "bg-primary text-white"
              : "hover:bg-gray-100 text-gray-700"
          }`}
          style={{ paddingLeft: `${12 + level * 16}px` }}
          onClick={handleFolderClick}
        >
          {hasChildren ? (
            <button
              onClick={handleChevronClick}
              className="flex-shrink-0 w-4 flex items-center justify-center hover:opacity-70"
            >
              <FontAwesomeIcon
                icon={isExpanded ? faChevronDown : faChevronRight}
                className="h-3 w-3"
              />
            </button>
          ) : (
            <span className="w-4"></span>
          )}

          <FontAwesomeIcon icon={faFolder} className="h-4 w-4 flex-shrink-0" />

          <span className="truncate flex-1">{node.name}</span>
        </div>

        {hasChildren && isExpanded && (
          <>
            {node.children.map((childNode, idx) => (
              <React.Fragment key={`child-${node.path}-${idx}`}>
                {renderFolderNode(childNode, level + 1)}
              </React.Fragment>
            ))}
          </>
        )}
      </>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-sm font-semibold text-gray-700 bg-gray-bg py-2 px-4 flex-shrink-0 border-b border-gray-line text-center">
        Folders
      </h3>
      <div className="space-y-1 overflow-y-auto px-4 py-2">
        {Array.isArray(folders) && folders.length > 0 ? (
          <>
            {folders.map((node, idx) => (
              <React.Fragment key={`folder-${idx}`}>
                {renderFolderNode(node)}
              </React.Fragment>
            ))}
          </>
        ) : (
          <p className="text-sm text-gray-500 p-4">No folders available</p>
        )}
      </div>
    </div>
  );
}
