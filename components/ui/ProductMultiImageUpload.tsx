import React, { useRef, useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faPlus,
  faEye,
  faXmark,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ProductMultiImageUploadProps {
  images: File[];
  setImages: (images: File[]) => void;
  maxImages?: number;
  disabled?: boolean;
  isUploading?: boolean;
}

function DraggableImage({
  file,
  idx,
  onRemove,
  onView,
  disabled = false,
}: {
  file: File;
  idx: number;
  onRemove: (idx: number) => void;
  onView: (idx: number) => void;
  disabled?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: idx });
  const url = URL.createObjectURL(file);
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : 1,
        touchAction: "none",
      }}
      className="relative w-28 h-28 border rounded bg-blue-80 flex flex-col items-center justify-center cursor-move"
      {...attributes}
      {...listeners}
    >
      <Image
        src={url}
        alt={`Product ${idx + 1}`}
        fill
        style={{ objectFit: "cover", pointerEvents: "none" }}
        className="rounded"
      />
      <div className="absolute top-1 right-1 flex gap-1 pointer-events-auto">
        {!disabled && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(idx);
            }}
            className="bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center hover:bg-red-600"
          >
            <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
          </button>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onView(idx);
          }}
          className="bg-blue-500 text-white rounded-full h-6 w-6 flex items-center justify-center hover:bg-blue-600"
        >
          <FontAwesomeIcon icon={faEye} className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

const ProductMultiImageUpload: React.FC<ProductMultiImageUploadProps> = ({
  images,
  setImages,
  maxImages = 8,
  disabled = false,
  isUploading = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fullscreenIdx, setFullscreenIdx] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    })
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (files.length > 0) {
      const newImages = [...images, ...files].slice(0, maxImages);
      setImages(newImages);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setImages(arrayMove(images, Number(active.id), Number(over.id)));
    }
  };

  return (
    <div>
      <h3 className="text-black title-4-semibold mb-4">
        Images (up to {maxImages})
      </h3>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
        disabled={images.length >= maxImages || isUploading}
      />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={images.map((_, idx) => idx)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex flex-wrap gap-4 mb-2">
            {images.map((file, idx) => (
              <DraggableImage
                key={file.name + idx}
                file={file}
                idx={idx}
                onRemove={handleRemoveImage}
                onView={setFullscreenIdx}
                disabled={disabled}
              />
            ))}
            {images.length < maxImages && !disabled && (
              <button
                type="button"
                onClick={handleUploadClick}
                disabled={isUploading}
                className={`w-28 h-28 border-2 border-dashed border-gray-line rounded flex flex-col items-center justify-center transition ${
                  isUploading
                    ? "text-gray-300 border-gray-300 cursor-not-allowed"
                    : "text-gray-400 hover:text-primary hover:border-primary"
                }`}
              >
                {isUploading ? (
                  <>
                    <FontAwesomeIcon
                      icon={faSpinner}
                      size="2x"
                      className="animate-spin"
                    />
                    <span className="text-xs mt-1">Uploading...</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faPlus} size="2x" />
                    <span className="text-xs mt-1">Add Image</span>
                  </>
                )}
              </button>
            )}
          </div>
        </SortableContext>
      </DndContext>
      {/* Fullscreen Modal */}
      {fullscreenIdx !== null && images[fullscreenIdx] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setFullscreenIdx(null)}
          style={{ zIndex: 1000, backgroundColor: "rgba(0, 0, 0, 0.8)" }}
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <Image
              src={URL.createObjectURL(images[fullscreenIdx])}
              alt={`Product Fullscreen`}
              width={1200}
              height={1200}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              type="button"
              onClick={() => setFullscreenIdx(null)}
              className="absolute top-4 right-4 text-white bg-red-500 p-2 rounded-full h-10 w-10 flex items-center justify-center"
            >
              <span className="text-lg">
                <FontAwesomeIcon icon={faXmark} />
              </span>
            </button>
          </div>
        </div>
      )}
      <p className="text-gray-10 xsmall mt-2">
        Accepts up to {maxImages} images. Drag and drop to reorder.
      </p>
    </div>
  );
};

export default ProductMultiImageUpload;
