import { handleNumberInputChange, handleNumberKeyDown } from './numberInputUtils';

export default function Inventory({ formData, handleInputChange, isViewMode = false }) {
  const handleNumberChange = (e) => {
    if (isViewMode) return;
    const cleanValue = handleNumberInputChange(e);
    e.target.value = cleanValue;
    handleInputChange(e);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm custom-border-1">
      <h3 className="text-black title-4-semibold mb-4">Inventory</h3>
      <div className="mb-4">
        <label className="flex items-center gap-2 cursor-pointer mb-4">
          <input
            type="checkbox"
            name="is_tracking_inventory"
            checked={formData.is_tracking_inventory || false}
            onChange={isViewMode ? () => {} : handleInputChange}
            disabled={isViewMode}
            className="rounded border-gray-300"
          />
          <span className="text-black small">
            Track inventory for this product
          </span>
        </label>

        <div className="mb-4">
          <label className="block text-black title-4-semibold mb-2">
            Quantity
          </label>
          {isViewMode ? (
            <div className="p-2 bg-gray-100 rounded-md text-black small">
              {formData.stock_qty || '0'}
            </div>
          ) : (
            <input
              type="text"
              inputMode="numeric"
              name="stock_qty"
              value={formData.stock_qty || ''}
              onChange={handleNumberChange}
              onKeyDown={handleNumberKeyDown}
              placeholder="0"
              className="w-full p-2 custom-border-3 bg-blue-80 rounded-md small focus:outline-none"
            />
          )}
        </div>

        <div className="mb-4">
          <label className="block text-black title-4-semibold mb-2">
            SKU (Stock Keeping Unit) <span className="text-red-500">*</span>
          </label>
          {isViewMode ? (
            <div className="p-2 bg-gray-100 rounded-md text-black small">
              {formData.sku || '-'}
            </div>
          ) : (
            <input
              type="text"
              name="sku"
              value={formData.sku || ''}
              onChange={handleInputChange}
              className="w-full p-2 custom-border-3 bg-blue-80 rounded-md small focus:outline-none"
            />
          )}
          <p className="text-gray-10 xxsmall mt-1">
            Only alphanumeric characters, hyphens (-) and underscores (_) are allowed
          </p>
        </div>

        <label className="flex items-center gap-2 cursor-pointer mb-4">
          <input
            type="checkbox"
            name="sell_out_of_stock"
            checked={formData.sell_out_of_stock || false}
            onChange={isViewMode ? () => {} : handleInputChange}
            disabled={isViewMode}
            className="rounded border-gray-300"
          />
          <span className="text-black small">
            Continue selling when out of stock
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer mb-4">
          <input
            type="checkbox"
            name="has_barcode"
            checked={formData.has_barcode || false}
            onChange={isViewMode ? () => {} : handleInputChange}
            disabled={isViewMode}
            className="rounded border-gray-300"
          />
          <span className="text-black small">
            This product has a Barcode
          </span>
        </label>

        {formData.has_barcode && (
          <div>
            <label className="block text-gray-10 xsmall mb-1">
              Barcode (ISBN, UPC, GTIN, etc.)
            </label>
            {isViewMode ? (
              <div className="p-2 bg-gray-100 rounded-md text-black small">
                {formData.barcode || '-'}
              </div>
            ) : (
              <input
                type="text"
                inputMode="numeric"
                name="barcode"
                value={formData.barcode || ''}
                onChange={handleNumberChange}
                onKeyDown={handleNumberKeyDown}
                className="w-full p-2 custom-border-3 bg-blue-80 rounded-md small focus:outline-none"
              />
            )}
            <p className="text-gray-10 xxsmall mt-1">
              Only numeric characters are allowed
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
