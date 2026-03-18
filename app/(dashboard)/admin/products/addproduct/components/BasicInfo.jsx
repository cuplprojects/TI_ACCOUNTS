import ProductMultiImageUpload from '@/components/ui/ProductMultiImageUpload';
import ExistingImageGallery from '@/components/ui/ExistingImageGallery';
import QuillEditor from '@/app/components/QuillEditor';

export default function BasicInfo({ 
  formData, 
  commonAttributes, 
  handleInputChange,
  handleEditorChange,
  editorRef,
  images,
  setImages,
  existingImages,
  setExistingImages,
  isViewMode = false,
}) {
  const title = formData.has_variations ? commonAttributes.title : formData.title;
  const shortDesc = formData.has_variations ? commonAttributes.short_description : formData.short_description;
  const description = formData.has_variations ? commonAttributes.description : formData.description;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm custom-border-1 space-y-4">
      <div>
        <h3 className="text-black title-4-semibold mb-2">
          Title <span className="text-red-500">*</span>
        </h3>
        {isViewMode ? (
          <div className="p-2 bg-gray-100 rounded-md text-black small">
            {title}
          </div>
        ) : (
          <input
            type="text"
            name="title"
            value={title}
            onChange={handleInputChange}
            placeholder="e.g. Summer Collection, Under 100, Staff picks"
            className="w-full p-2 small focus:outline-none custom-border-3 bg-blue-80 rounded-md"
          />
        )}
      </div>

      {!formData.has_variations && (
        <div>
          <h3 className="text-black title-4-semibold mb-2">
            Product Images <span className="text-red-500">*</span>
          </h3>
          
          {existingImages.length > 0 && (
            <div className="mb-4">
              <h4 className="text-gray-700 text-sm font-medium mb-2">
                Current Images
              </h4>
              <ExistingImageGallery
                images={existingImages}
                setImages={setExistingImages}
                isViewMode={isViewMode}
              />
            </div>
          )}

          {!isViewMode && (
            <ProductMultiImageUpload
              images={images}
              setImages={setImages}
              maxImages={8 - existingImages.length}
              disabled={false}
            />
          )}
        </div>
      )}

      {formData.has_variations && (
        <div>
          <h3 className="text-black title-4-semibold mb-2">
            Common Product Images <span className="text-red-500">*</span>
          </h3>
          <p className="text-gray-10 xxsmall mb-2">
            These images will be used for the product when no specific variant is selected
          </p>
          
          {existingImages.length > 0 && (
            <div className="mb-4">
              <h4 className="text-gray-700 text-sm font-medium mb-2">
                Current Common Images
              </h4>
              <ExistingImageGallery
                images={existingImages}
                setImages={setExistingImages}
                isViewMode={isViewMode}
              />
            </div>
          )}

          {!isViewMode && (
            <ProductMultiImageUpload
              images={images}
              setImages={setImages}
              maxImages={8 - existingImages.length}
              disabled={false}
            />
          )}
        </div>
      )}

      <div>
        <h3 className="text-black title-4-semibold mb-2">
          Short Description
        </h3>
        {isViewMode ? (
          <div className="p-2 bg-gray-100 rounded-md text-black small whitespace-pre-wrap">
            {shortDesc}
          </div>
        ) : (
          <textarea
            name="short_description"
            value={shortDesc}
            onChange={handleInputChange}
            placeholder="A brief summary of the product (max 150 characters)..."
            className="w-full p-2 small focus:outline-none custom-border-3 bg-blue-80 rounded-md"
            rows={2}
            maxLength={150}
          />
        )}
        <p className="text-gray-10 xxsmall mt-1">
          {shortDesc.length}/150 characters
        </p>
      </div>

      <div>
        <h3 className="text-black title-4-semibold mb-2">
          Description <span className="text-red-500">*</span>
        </h3>
        <div className="border border-gray-line rounded-md">
          <QuillEditor
            ref={editorRef}
            value={description}
            onChange={handleEditorChange}
            disabled={isViewMode}
            placeholder="Enter product description..."
          />
        </div>
      </div>
    </div>
  );
}
