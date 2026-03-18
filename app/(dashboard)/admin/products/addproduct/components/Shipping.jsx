import { handleNumberInputChange, handleNumberKeyDown } from './numberInputUtils';

export default function Shipping({
  formData,
  isPhysicalProduct,
  setIsPhysicalProduct,
  handleInputChange,
  isViewMode = false,
}) {
  const handleNumberChange = (e) => {
    if (isViewMode) return;
    const cleanValue = handleNumberInputChange(e);
    e.target.value = cleanValue;
    handleInputChange(e);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm custom-border-1">
      <h3 className="text-black title-4-semibold mb-4">Shipping</h3>
      <div className="mb-4">
        <label className="flex items-center gap-2 cursor-pointer mb-4">
          <input
            type="checkbox"
            name="physical_product"
            checked={isPhysicalProduct}
            onChange={isViewMode ? () => {} : (e) => {
              setIsPhysicalProduct(e.target.checked);
              handleInputChange(e);
            }}
            disabled={isViewMode}
            className="rounded border-gray-300"
          />
          <span className="text-black small">
            This is physical product
          </span>
        </label>

        {/* Weight and Dimensions - Only show if physical product */}
        {isPhysicalProduct && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-black title-4-semibold mb-2">
                Weight <span className="text-red-500">*</span>
              </label>
              {isViewMode ? (
                <div className="p-2 bg-gray-100 rounded-md text-black small">
                  {formData.weight || '0'} kg
                </div>
              ) : (
                <div className="flex">
                  <input
                    type="text"
                    inputMode="decimal"
                    name="weight"
                    value={formData.weight || ''}
                    onChange={handleNumberChange}
                    onKeyDown={handleNumberKeyDown}
                    placeholder="0.0"
                    className="w-full p-2 custom-border-3 bg-blue-80 rounded-l-md small focus:outline-none"
                  />
                  <select className="p-2 border-y-2 border-r-2 border-gray-line bg-blue-80 rounded-r-md small">
                    <option>kg</option>
                  </select>
                </div>
              )}
            </div>
            <div>
              <label className="block text-black title-4-semibold mb-2">
                Dimensions <span className="text-red-500">*</span>
              </label>
              {isViewMode ? (
                <div className="p-2 bg-gray-100 rounded-md text-black small">
                  L: {formData.length || '0'} × W: {formData.breadth || '0'} × H: {formData.height || '0'} cm
                </div>
              ) : (
                <div className="flex gap-1">
                  <input
                    type="text"
                    inputMode="decimal"
                    name="length"
                    value={formData.length || ''}
                    onChange={handleNumberChange}
                    onKeyDown={handleNumberKeyDown}
                    placeholder="Length"
                    className="w-full p-2 custom-border-3 bg-blue-80 small focus:outline-none"
                  />
                  <input
                    type="text"
                    inputMode="decimal"
                    name="breadth"
                    value={formData.breadth || ''}
                    onChange={handleNumberChange}
                    onKeyDown={handleNumberKeyDown}
                    placeholder="Width"
                    className="w-full p-2 custom-border-3 bg-blue-80 small focus:outline-none"
                  />
                  <input
                    type="text"
                    inputMode="decimal"
                    name="height"
                    value={formData.height || ''}
                    onChange={handleNumberChange}
                    onKeyDown={handleNumberKeyDown}
                    placeholder="Height"
                    className="w-full p-2 custom-border-3 bg-blue-80 small focus:outline-none"
                  />
                  <select className="p-2 custom-border-3 bg-blue-80 small">
                    <option>cm</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Country/Region of Origin - Always visible */}
        <div className="mb-4">
          <label className="block text-black title-4-semibold mb-2">
            Country/Region of Origin <span className="text-red-500">*</span>
          </label>
          {isViewMode ? (
            <div className="p-2 bg-gray-100 rounded-md text-black small">
              {formData.region_of_origin || 'India'}
            </div>
          ) : (
            <select
              name="region_of_origin"
              value={formData.region_of_origin}
              onChange={handleInputChange}
              className="w-full p-2 custom-border-3 bg-blue-80 rounded-md small focus:outline-none"
            >
              <option value="India">India</option>
            </select>
          )}
        </div>

        {/* HS Code - Always visible */}
        <div className="mb-4">
          <label className="block text-black title-4-semibold mb-2">
            Harmonised System (HS) code <span className="text-red-500">*</span>
            <span className="text-gray-10 xsmall ml-2">(limit: 8 digits)</span>
          </label>
          {isViewMode ? (
            <div className="p-2 bg-gray-100 rounded-md text-black small">
              {formData.hs_code || '-'}
            </div>
          ) : (
            <input
              type="text"
              inputMode="numeric"
              name="hs_code"
              value={formData.hs_code || ''}
              onChange={handleNumberChange}
              onKeyDown={handleNumberKeyDown}
              placeholder="Enter 8-digit HS code"
              className="w-full p-2 custom-border-3 bg-blue-80 rounded-md small focus:outline-none"
              maxLength={8}
            />
          )}
          <p className="text-gray-10 xxsmall mt-1">
            Only numeric characters are allowed
          </p>
        </div>
      </div>
    </div>
  );
}
