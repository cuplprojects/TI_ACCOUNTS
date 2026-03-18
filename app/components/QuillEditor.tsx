"use client";

import { useEffect, useRef, useState, forwardRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { uploadEditorImage } from "@/app/lib/services/imageUploadService";

// Dynamically import ImageResize to avoid SSR issues
let ImageResize: any;
if (typeof window !== "undefined") {
  ImageResize = require("quill-image-resize-module-react").default;
  if (Quill && ImageResize) {
    Quill.register("modules/imageResize", ImageResize);
  }
}

interface QuillEditorProps {
  value: string;
  onChange: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
  uploadEndpoint?: "admin" | "seller";
}

export interface QuillEditorHandle {
  getContent: () => string;
}

const QuillEditor = forwardRef<QuillEditorHandle, QuillEditorProps>(
  (
    {
      value,
      onChange,
      disabled = false,
      placeholder = "Enter description...",
      uploadEndpoint = "admin",
    },
    ref
  ) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const quillRef = useRef<any>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    // Expose getContent method via ref
    useEffect(() => {
      if (typeof ref === "function") {
        ref({
          getContent: () => quillRef.current?.root.innerHTML || "",
        });
      } else if (ref) {
        ref.current = {
          getContent: () => quillRef.current?.root.innerHTML || "",
        };
      }
    }, [ref, mounted]);

  useEffect(() => {
    if (!mounted || !editorRef.current) return;

    if (!quillRef.current) {
      // Build modules object safely
      const modules: any = {
        toolbar: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ script: "sub" }, { script: "super" }],
          [{ color: [] }, { background: [] }],
          [{ font: [] }],
          [{ size: ["small", false, "large", "huge"] }],
          [{ align: [] }],
          ["blockquote", "code-block"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ indent: "-1" }, { indent: "+1" }],
          ["link", "image", "video"],
          ["clean"],
        ],
      };

      // Only add imageResize if it's available
      if (ImageResize && typeof Quill.import === "function") {
        try {
          modules.imageResize = {
            parchment: Quill.import("parchment"),
            modules: ["Resize", "DisplaySize"],
          };
        } catch (error) {
          console.warn("ImageResize module not available:", error);
        }
      }

      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
        modules,
        readOnly: disabled,
      });

      // Set initial value - only if value is not empty
      if (value && value.trim()) {
        quillRef.current.root.innerHTML = value;
      } else {
        // Ensure editor is empty so placeholder shows
        quillRef.current.root.innerHTML = "";
      }

      // Don't call onChange on every text change - let parent handle it on form submission
      // This prevents the entire form from re-rendering on every keystroke

      // Image upload handler
      const imageHandler = async () => {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("accept", "image/*");

        input.onchange = async () => {
          const file = input.files?.[0];
          if (!file) return;

          try {
            const range = quillRef.current?.getSelection();
            if (!range) return;

            // Upload image using the service
            const imageUrl = await uploadEditorImage(file, uploadEndpoint);

            if (quillRef.current && range) {
              quillRef.current.insertEmbed(range.index, "image", imageUrl);
              quillRef.current.setSelection(range.index + 1);
            }
          } catch (error) {
            console.error("Image insert failed:", error);
            alert(
              error instanceof Error
                ? error.message
                : "Failed to upload image. Please try again."
            );
          }
        };

        input.click();
      };

      const toolbar = quillRef.current.getModule("toolbar") as any;
      toolbar.addHandler("image", imageHandler);
    }
  }, [mounted, placeholder, uploadEndpoint]);

  // Only update editor when value changes from outside (not from onChange)
  useEffect(() => {
    if (quillRef.current && mounted) {
      const currentContent = quillRef.current.root.innerHTML;
      const newValue = value && value.trim() ? value : "";
      
      // Always update if values differ
      if (currentContent !== newValue) {
        quillRef.current.root.innerHTML = newValue;
      }
    }
  }, [value, mounted]);

  useEffect(() => {
    if (quillRef.current) {
      quillRef.current.enable(!disabled);
    }
  }, [disabled]);

  return (
    <div className="quill-editor-wrapper">
      <style jsx>{`
        .quill-editor-wrapper :global(.ql-container) {
          font-size: 1rem;
          font-family: inherit;
          border: 1px solid #d1d5db;
          border-top: none;
          border-radius: 0 0 0.375rem 0.375rem;
          background-color: #f9fafb;
        }

        .quill-editor-wrapper :global(.ql-editor) {
          min-height: 250px;
          padding: 1rem;
          background-color: #f9fafb;
        }

        .quill-editor-wrapper :global(.ql-toolbar) {
          border: 1px solid #d1d5db;
          border-radius: 0.375rem 0.375rem 0 0;
          background-color: #f3f4f6;
          flex-wrap: wrap;
        }

        .quill-editor-wrapper :global(.ql-toolbar button:hover),
        .quill-editor-wrapper :global(.ql-toolbar button.ql-active),
        .quill-editor-wrapper :global(.ql-toolbar button:focus),
        .quill-editor-wrapper :global(.ql-toolbar button.ql-selected) {
          color: #3b82f6;
        }

        .quill-editor-wrapper :global(.ql-toolbar.ql-snow .ql-picker-label) {
          color: #374151;
        }

        .quill-editor-wrapper :global(.ql-snow .ql-stroke) {
          stroke: #6b7280;
        }

        .quill-editor-wrapper :global(.ql-snow .ql-fill),
        .quill-editor-wrapper :global(.ql-snow .ql-stroke.ql-fill) {
          fill: #6b7280;
        }

        .quill-editor-wrapper :global(.ql-editor) {
          color: #1f2937;
        }

        .quill-editor-wrapper :global(.ql-editor h1) {
          font-size: 1.8rem;
          font-weight: 600;
          margin: 1rem 0 0.5rem 0;
        }

        .quill-editor-wrapper :global(.ql-editor h2) {
          font-size: 1.6rem;
          font-weight: 600;
          margin: 1rem 0 0.5rem 0;
        }

        .quill-editor-wrapper :global(.ql-editor h3) {
          font-size: 1.4rem;
          font-weight: 600;
          margin: 1rem 0 0.5rem 0;
        }

        .quill-editor-wrapper :global(.ql-editor h4) {
          font-size: 1.2rem;
          font-weight: 600;
          margin: 1rem 0 0.5rem 0;
        }

        .quill-editor-wrapper :global(.ql-editor h5) {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 1rem 0 0.5rem 0;
        }

        .quill-editor-wrapper :global(.ql-editor h6) {
          font-size: 1rem;
          font-weight: 600;
          margin: 1rem 0 0.5rem 0;
        }

        .quill-editor-wrapper :global(.ql-editor ul),
        .quill-editor-wrapper :global(.ql-editor ol) {
          margin-left: 1.5rem;
          margin-bottom: 0.75rem;
        }

        .quill-editor-wrapper :global(.ql-editor li) {
          margin-bottom: 0.25rem;
        }

        .quill-editor-wrapper :global(.ql-editor blockquote) {
          border-left: 4px solid #3b82f6;
          padding-left: 1rem;
          margin-left: 0;
          margin-bottom: 0.75rem;
          color: #666;
          font-style: italic;
        }

        .quill-editor-wrapper :global(.ql-editor pre) {
          background-color: #f3f4f6;
          border-radius: 0.375rem;
          padding: 1rem;
          overflow-x: auto;
          margin-bottom: 0.75rem;
        }

        .quill-editor-wrapper :global(.ql-editor code) {
          background-color: #f3f4f6;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-family: monospace;
        }

        .quill-editor-wrapper :global(.ql-editor pre code) {
          background-color: transparent;
          padding: 0;
        }

        .quill-editor-wrapper :global(.ql-editor img) {
          max-width: 100%;
          height: auto;
          border-radius: 0.375rem;
          margin: 0.5rem 0;
          cursor: pointer;
        }

        .quill-editor-wrapper :global(.ql-editor a) {
          color: #3b82f6;
          text-decoration: underline;
        }

        .quill-editor-wrapper :global(.ql-editor a:hover) {
          color: #1d4ed8;
        }

        .quill-editor-wrapper :global(.ql-editor hr) {
          border: none;
          border-top: 2px solid #e5e7eb;
          margin: 1rem 0;
        }

        .quill-editor-wrapper :global(.ql-disabled) {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Image Resize Module Styles - No blinking */
        .quill-editor-wrapper :global(.ql-editor .ql-resize-module) {
          position: relative;
          will-change: auto;
        }

        .quill-editor-wrapper :global(.ql-editor img.ql-resize-module) {
          border: 2px solid #3b82f6;
        }

        .quill-editor-wrapper :global(.ql-resize-module-overlay) {
          position: absolute;
          box-sizing: border-box;
          border: 2px dashed #3b82f6;
          background-color: rgba(59, 130, 246, 0.05);
          pointer-events: none;
        }

        .quill-editor-wrapper :global(.ql-resize-module-handle) {
          position: absolute;
          width: 12px;
          height: 12px;
          background-color: #3b82f6;
          border: 2px solid white;
          box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
          cursor: nwse-resize;
          pointer-events: auto;
        }

        .quill-editor-wrapper :global(.ql-resize-module-handle.top-left) {
          top: -6px;
          left: -6px;
          cursor: nwse-resize;
        }

        .quill-editor-wrapper :global(.ql-resize-module-handle.top-right) {
          top: -6px;
          right: -6px;
          cursor: nesw-resize;
        }

        .quill-editor-wrapper :global(.ql-resize-module-handle.bottom-left) {
          bottom: -6px;
          left: -6px;
          cursor: nesw-resize;
        }

        .quill-editor-wrapper :global(.ql-resize-module-handle.bottom-right) {
          bottom: -6px;
          right: -6px;
          cursor: nwse-resize;
        }

        .quill-editor-wrapper :global(.ql-resize-module-display-size) {
          position: absolute;
          top: -25px;
          left: 0;
          background-color: #3b82f6;
          color: white;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 12px;
          font-weight: 500;
          pointer-events: none;
          white-space: nowrap;
        }

        .quill-editor-wrapper :global(.ql-toolbar.ql-snow .ql-formats) {
          margin-right: 15px;
        }

        .quill-editor-wrapper :global(.ql-toolbar.ql-snow .ql-picker) {
          margin-right: 8px;
        }
      `}</style>

      <div ref={editorRef} />
    </div>
  );
  }
);

QuillEditor.displayName = "QuillEditor";

export default QuillEditor;
