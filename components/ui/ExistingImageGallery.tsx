import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
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

interface ExistingImage {
  url: string;
  position: number;
  key?: string;
  originalName?: string;
}

interface ExistingImageGalleryProps {
  images: ExistingImage[];
  setImages: (images: ExistingImage[]) => void;
  isViewMode?: boolean;
}

function DraggableExistingImage({
  image,
  idx,
  onRemove,
  isViewMode = false,
}: {
  image: ExistingImage;
  idx: number;
  onRemove: (idx: number) => void;
  isViewMode?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: idx });

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
      <img
        src={image.url}
        alt={`Product ${image.position}`}
        className="rounded w-full h-full object-cover"
        style={{ pointerEvents: "none" }}
      />
      {!isViewMode && (
        <div className="absolute top-1 right-1 flex gap-1 pointer-events-auto">
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
        </div>
      )}
    </div>
  );
}

const ExistingImageGallery: React.FC<ExistingImageGalleryProps> = ({
  images,
  setImages,
  isViewMode = false,
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

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const reorderedImages = arrayMove(images, Number(active.id), Number(over.id));
      // Update positions after reordering
      const updatedImages = reorderedImages.map((img, idx) => ({
        ...img,
        position: idx,
      }));
      setImages(updatedImages);
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
        <div className="flex flex-wrap gap-4 mb-4">
          {images
            .sort((a, b) => a.position - b.position)
            .map((img, idx) => (
              <DraggableExistingImage
                key={`${img.key}-${idx}`}
                image={img}
                idx={idx}
                onRemove={handleRemoveImage}
                isViewMode={isViewMode}
              />
            ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default ExistingImageGallery;
