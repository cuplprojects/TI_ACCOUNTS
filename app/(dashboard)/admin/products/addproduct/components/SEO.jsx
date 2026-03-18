export default function SEO({ formData, commonAttributes, handleInputChange, isViewMode = false }) {
  const pageTitle = formData.has_variations ? commonAttributes.page_title : formData.page_title;
  const pageDesc = formData.has_variations ? commonAttributes.page_description : formData.page_description;
  const pageUrl = formData.has_variations ? commonAttributes.page_url : formData.page_url;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm custom-border-1 !px-0">
      <div className="top px-6">
        <h3 className="text-black title-4-semibold mb-2">
          Search Engine Listing
        </h3>
        <p className="text-gray-10 xsmall mb-4">
          Add a title and description to see how this product might appear in a search engine listing
        </p>
      </div>
      <div className="h-[2px] bg-gray-line my-4"></div>
      <div className="bottom px-6">
        <div className="space-y-4">
          <div>
            <label className="block text-black title-4-semibold mb-2">
              Page Title
            </label>
            {isViewMode ? (
              <div className="p-2 bg-gray-100 rounded-md text-black small whitespace-pre-wrap">
                {pageTitle || '-'}
              </div>
            ) : (
              <textarea
                name="page_title"
                value={pageTitle}
                onChange={handleInputChange}
                className="w-full p-2 custom-border-3 bg-blue-80 rounded-md small focus:outline-none"
                placeholder="Enter page title here..."
              ></textarea>
            )}
            <p className="text-gray-10 xxsmall mt-1">
              {pageTitle.length} of 70 characters used
            </p>
          </div>
          <div>
            <label className="block text-black title-4-semibold mb-2">
              Page Description
            </label>
            {isViewMode ? (
              <div className="p-2 bg-gray-100 rounded-md text-black small whitespace-pre-wrap">
                {pageDesc || '-'}
              </div>
            ) : (
              <textarea
                name="page_description"
                value={pageDesc}
                onChange={handleInputChange}
                className="w-full p-2 custom-border-3 bg-blue-80 rounded-md small focus:outline-none"
                placeholder="Enter page description here..."
              ></textarea>
            )}
            <p className="text-gray-10 xxsmall mt-1">
              {pageDesc.length} of 160 characters used
            </p>
          </div>
          <div>
            <label className="block text-black title-4-semibold mb-2">
              URL Handle
            </label>
            {isViewMode ? (
              <div className="p-2 bg-gray-100 rounded-md text-black small">
                {pageUrl || '-'}
              </div>
            ) : (
              <input
                type="text"
                name="page_url"
                value={pageUrl}
                onChange={handleInputChange}
                className="w-full p-2 custom-border-3 bg-blue-80 rounded-md small focus:outline-none"
                placeholder="product-name"
              />
            )}
            <span className="text-blue-100 xsmall-medium block mt-2">
              https://totallyindian.com/products/{pageUrl}
            </span>
            <span className="text-gray-10 xxsmall mt-1 block">
              Only lowercase letters, numbers, and hyphens allowed. No spaces or special characters.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
