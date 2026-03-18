import { handleNumberInputChange, handleNumberKeyDown } from './numberInputUtils';

export default function Pricing({ formData, handleInputChange, isViewMode = false }) {
  const handleNumberChange = (e) => {
    if (isViewMode) return;
    const cleanValue = handleNumberInputChange(e);
    const { name } = e.target;
    
    // Create a new synthetic event with the cleaned value
    const syntheticEvent = {
      target: {
        name: name,
        value: cleanValue,
        type: 'text'
      }
    };
    
    // Call handleInputChange with the cleaned value
    handleInputChange(syntheticEvent);
    
    // Calculate profit and margin when price or cost_per_item changes
    if (name === 'price' || name === 'cost_per_item') {
      const price = name === 'price' ? parseFloat(cleanValue) || 0 : parseFloat(formData.price) || 0;
      const costPerItem = name === 'cost_per_item' ? parseFloat(cleanValue) || 0 : parseFloat(formData.cost_per_item) || 0;

      const profit = price - costPerItem;
      let margin = 0;
      
      // Calculate margin only if price is greater than 0
      if (price > 0) {
        margin = (profit / price) * 100;
      }
      
      // Update profit
      const profitEvent = {
        target: {
          name: 'profit',
          value: parseFloat(profit.toFixed(2)),
          type: 'text'
        }
      };
      handleInputChange(profitEvent);
      
      // Update margin
      const marginEvent = {
        target: {
          name: 'margin',
          value: parseFloat(margin.toFixed(2)),
          type: 'text'
        }
      };
      handleInputChange(marginEvent);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm custom-border-1">
      <h3 className="text-black title-4-semibold mb-4">Pricing</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-black title-4-semibold mb-2">
            Price <span className="text-red-500">*</span>
          </label>
          {isViewMode ? (
            <div className="p-2 bg-gray-100 rounded-md text-black small">
              ₹ {formData.price || '0.00'}
            </div>
          ) : (
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-10">₹</span>
              <input
                type="text"
                inputMode="decimal"
                name="price"
                value={formData.price || ''}
                onChange={handleNumberChange}
                onKeyDown={handleNumberKeyDown}
                placeholder="0.00"
                className="w-full !pl-6 p-2 custom-border-3 bg-blue-80 rounded-md small focus:outline-none"
              />
            </div>
          )}
        </div>
        <div>
          <label className="block text-black title-4-semibold mb-2">
            Compare-at price
          </label>
          {isViewMode ? (
            <div className="p-2 bg-gray-100 rounded-md text-black small">
              ₹ {formData.compare_price || '0.00'}
            </div>
          ) : (
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-10">₹</span>
              <input
                type="text"
                inputMode="decimal"
                name="compare_price"
                value={formData.compare_price || ''}
                onChange={handleNumberChange}
                onKeyDown={handleNumberKeyDown}
                placeholder="0.00"
                className="w-full !pl-6 p-2 custom-border-3 bg-blue-80 rounded-md small focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-black title-4-semibold mb-2">
            Cost per item
          </label>
          {isViewMode ? (
            <div className="p-2 bg-gray-100 rounded-md text-black small">
              ₹ {formData.cost_per_item || '0.00'}
            </div>
          ) : (
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-10">₹</span>
              <input
                type="text"
                inputMode="decimal"
                name="cost_per_item"
                value={formData.cost_per_item || ''}
                onChange={handleNumberChange}
                onKeyDown={handleNumberKeyDown}
                placeholder="0.00"
                className="w-full !pl-6 p-2 custom-border-3 bg-blue-80 rounded-md small focus:outline-none"
              />
            </div>
          )}
        </div>
        <div>
          <label className="block text-black title-4-semibold mb-2">
            Profit
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-10">₹</span>
            <input
              type="text"
              name="profit"
              value={formData.profit || '0.00'}
              readOnly
              placeholder="0.00"
              className="w-full !pl-6 p-2 custom-border-3 bg-blue-80 rounded-md small focus:outline-none bg-gray-100 cursor-not-allowed"
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-black title-4-semibold mb-2">
            GST Percentage <span className="text-red-500">*</span>
          </label>
          {isViewMode ? (
            <div className="p-2 bg-gray-100 rounded-md text-black small">
              {formData.gst_percent !== undefined && formData.gst_percent !== null && formData.gst_percent !== '' ? `${formData.gst_percent}%` : 'Not selected'}
            </div>
          ) : (
            <select
              name="gst_percent"
              value={String(formData.gst_percent !== undefined && formData.gst_percent !== null ? formData.gst_percent : '')}
              onChange={handleInputChange}
              className="w-full p-2 custom-border-3 bg-blue-80 rounded-md small focus:outline-none"
            >
              <option value="">Select GST Percentage</option>
              <option value="0">0%</option>
              <option value="5">5%</option>
              <option value="12">12%</option>
              <option value="18">18%</option>
              <option value="28">28%</option>
            </select>
          )}
        </div>
        <div>
          <label className="block text-black title-4-semibold mb-2">
            Margin
          </label>
          <div className="relative">
            <input
              type="text"
              name="margin"
              value={formData.margin || '0.00'}
              readOnly
              placeholder="0.00"
              className="w-full p-2 custom-border-3 bg-blue-80 rounded-md small focus:outline-none bg-gray-100 cursor-not-allowed"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-10">%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
