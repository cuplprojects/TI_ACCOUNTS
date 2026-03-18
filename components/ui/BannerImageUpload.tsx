import React, { useRef, useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faPlus,
  faEye,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

interface SingleBannerUploadProps {
  title: string;
  desktopImage: File | null;
  mobileImage: File | null;
  onDesktopImageChange: (image: File | null) => void;
  onMobileImageChange: (image: File | null) => void;
  useSameForBoth: boolean;
  onUseSameForBothChange: (value: boolean) => void;
}

const SingleBannerUpload: React.FC<SingleBannerUploadProps> = ({
  title,
  desktopImage,
  mobileImage,
  onDesktopImageChange,
  onMobileImageChange,
  useSameForBoth,
  onUseSameForBothChange,
}) => {
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const [fullscreenImage, setFullscreenImage] = useState<{
    src: string;
    type: string;
  } | null>(null);

  const handleDesktopFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] || null;
    onDesktopImageChange(file);

    if (useSameForBoth && file) {
      const mobileFile = new File([file], file.name, {
        type: file.type,
        lastModified: file.lastModified,
      });
      onMobileImageChange(mobileFile);
    }

    if (desktopInputRef.current) desktopInputRef.current.value = "";
  };

  const handleMobileFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] || null;
    onMobileImageChange(file);

    if (mobileInputRef.current) mobileInputRef.current.value = "";
  };

  const handleRemoveDesktopImage = () => {
    onDesktopImageChange(null);
    if (useSameForBoth) {
      onMobileImageChange(null);
    }
  };

  const handleRemoveMobileImage = () => {
    onMobileImageChange(null);
  };

  const handleViewImage = (file: File, type: string) => {
    setFullscreenImage({ src: URL.createObjectURL(file), type });
  };

  const handleUseSameChange = (checked: boolean) => {
    onUseSameForBothChange(checked);
    if (checked && desktopImage) {
      onMobileImageChange(desktopImage);
    }
  };

  const renderImageUpload = (
    image: File | null,
    type: "desktop" | "mobile",
    inputRef: React.RefObject<HTMLInputElement | null>,
    onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
    onRemove: () => void,
    disabled: boolean = false
  ) => {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="small-semibold text-gray-110 capitalize">{type}</h4>
          {disabled && (
            <span className="xxsmall text-gray-50 italic">
              Using desktop image
            </span>
          )}
        </div>

        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="hidden"
          disabled={disabled}
        />

        {image ? (
          <div className="relative group">
            <div className="aspect-video border border-gray-line rounded-lg overflow-hidden bg-gray-40">
              <Image
                src={URL.createObjectURL(image)}
                alt={`${type} banner`}
                fill
                style={{ objectFit: "cover" }}
                className="transition-transform group-hover:scale-105"
              />
            </div>
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => handleViewImage(image, type)}
                className="bg-blue-00 text-white rounded-full h-6 w-6 flex items-center justify-center hover:bg-blue-10 transition"
                title="View"
              >
                <FontAwesomeIcon icon={faEye} className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={onRemove}
                className="bg-orange-00 text-white rounded-full h-6 w-6 flex items-center justify-center hover:opacity-80 transition"
                title="Delete"
                disabled={disabled}
              >
                <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef?.current?.click()}
            disabled={disabled}
            className="aspect-video border-2 border-dashed border-gray-line rounded-lg flex flex-col items-center justify-center text-gray-50 hover:text-blue-00 hover:border-blue-00 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FontAwesomeIcon icon={faPlus} className="h-6 w-6 mb-1" />
            <span className="xxsmall">Add {type} image</span>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="banner-upload-container">
      <div className="flex items-center justify-between mb-4">
        <h3 className="title-4-semibold text-black">{title}</h3>
        <label className="flex items-center gap-2 small">
          <input
            type="checkbox"
            checked={useSameForBoth}
            onChange={(e) => handleUseSameChange(e.target.checked)}
            className="rounded border-gray-line focus:ring-2 focus:ring-blue-00"
          />
          <span className="text-gray-110">Use same image for mobile</span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderImageUpload(
          desktopImage,
          "desktop",
          desktopInputRef,
          handleDesktopFileChange,
          handleRemoveDesktopImage,
          false
        )}

        {renderImageUpload(
          useSameForBoth ? desktopImage : mobileImage,
          "mobile",
          mobileInputRef,
          handleMobileFileChange,
          handleRemoveMobileImage,
          useSameForBoth
        )}
      </div>

      {/* Fullscreen Modal */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setFullscreenImage(null)}
          style={{ zIndex: 1000, backgroundColor: "rgba(0, 0, 0, 0.8)" }}
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <Image
              src={fullscreenImage.src}
              alt={`${fullscreenImage.type} banner fullscreen`}
              width={1200}
              height={1200}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              type="button"
              onClick={() => setFullscreenImage(null)}
              className="absolute top-4 right-4 text-white bg-orange-00 p-2 rounded-full h-10 w-10 flex items-center justify-center hover:opacity-80 transition"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
        </div>
      )}

      <p className="text-gray-50 xxsmall mt-4">
        Supported formats: JPG, PNG, WebP. Max file size: 5MB
      </p>
    </div>
  );
};

export default SingleBannerUpload;
