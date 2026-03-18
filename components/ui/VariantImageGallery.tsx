import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
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

interface VariantImage {
  url?: string;
  position?: number;
  key?: string;
  originalName?: string;
}

interface VariantImageGalleryProps {
  images: VariantImage[];
  onImagesChange: (images: VariantImage[]) => void;
  onRemoveImage: (index: number) => void;
  disabled?: boolean;
}

function DraggableVariantImage({
  image,
  idx,
  onRemove,
  disabled = false,
}: {
  image: VariantImage;
  idx: number;
  onRemove: (idx: number) => void;
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

  // Construct image URL from key if url is not available
  const imageUrl = image.url || (image.key ? `https://totallyassets.s3.ap-south-1.amazonaws.com/${image.key}` : null);

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
      className="relative w-16 h-16 border rounded cursor-move"
      {...attributes}
      {...listeners}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={`Variant image ${idx + 1}`}
          className="w-full h-full object-cover rounded"
          style={{ pointerEvents: "none" }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs">
          No Image
        </div>
      )}
      {!disabled && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(idx);
          }}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center hover:bg-red-600 pointer-events-auto"
        >
          <FontAwesomeIcon icon={faTimes} className="h-2 w-2" />
        </button>
      )}
    </div>
  );
}

const VariantImageGallery: React.FC<VariantImageGalleryProps> = ({
  images,
  onImagesChange,
  onRemoveImage,
  disabled = false,
}) => {
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const reorderedImages = arrayMove(images, Number(active.id), Number(over.id));
      // Update positions after reordering
      const updatedImages = reorderedImages.map((img, idx) => ({
        ...img,
        position: idx,
      }));
      onImagesChange(updatedImages);
    }
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={images.map((_, idx) => idx)}
        strategy={horizontalListSortingStrategy}
      >
        <div className="flex flex-wrap gap-2 mb-2">
          {images
            .sort((a, b) => (a.position || 0) - (b.position || 0))
            .map((img, idx) => (
              <DraggableVariantImage
                key={`${img.key}-${idx}`}
                image={img}
                idx={idx}
                onRemove={onRemoveImage}
                disabled={disabled}
              />
            ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default VariantImageGallery;
