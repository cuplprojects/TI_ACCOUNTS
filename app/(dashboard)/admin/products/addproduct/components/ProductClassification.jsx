const COUNTRIES = ['India'];

export default function ProductClassification({ formData, commonAttributes, handleInputChange, isViewMode = false }) {
  const isVariant = formData.has_variations;
  const gstPercent = isVariant ? commonAttributes.gst_percent : formData.gst_percent;
  const hsCode = isVariant ? commonAttributes.hs_code : formData.hs_code;
  const regionOfOrigin = isVariant ? commonAttributes.region_of_origin : formData.region_of_origin;

  const handleNumberChange = (e) => {
    if (isViewMode) return;
    const { name, value } = e.target;
    
    if (name === 'hs_code') {
      // Only allow numeric characters, max 8 digits
      const sanitized = value.replace(/[^0-9]/g, '').slice(0, 8);
      handleInputChange({ target: { name, value: sanitized, type: 'text' } });
    } else {
      handleInputChange(e);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm custom-border-1">
      <h3 className="text-black title-4-semibold mb-4">Product Classification</h3>

      <div className="space-y-4">
        {/* GST Percentage */}
        <div>
          <label className="block text-black title-4-semibold mb-2">
            GST Percentage <span className="text-red-500">*</span>
          </label>
          {isViewMode ? (
            <div className="p-2 bg-gray-100 rounded-md text-black small">
              {gstPercent !== undefined && gstPercent !== null && gstPercent !== '' ? `${gstPercent}%` : 'Not selected'}
            </div>
          ) : (
            <select
              name="gst_percent"
              value={String(gstPercent !== undefined && gstPercent !== null ? gstPercent : '')}
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

        {/* Region of Origin */}
        <div>
          <label className="block text-black title-4-semibold mb-2">
            Region of Origin
          </label>
          {isViewMode ? (
            <div className="p-2 bg-gray-100 rounded-md text-black small">
              {regionOfOrigin || 'India'}
            </div>
          ) : (
            <select
              name="region_of_origin"
              value={regionOfOrigin}
              onChange={handleInputChange}
              disabled
              className="w-full p-2 custom-border-3 bg-blue-80 rounded-md small focus:outline-none"
            >
              {COUNTRIES.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* HS Code */}
        <div>
          <label className="block text-black title-4-semibold mb-2">
            HS Code <span className="text-red-500">*</span>
          </label>
          {isViewMode ? (
            <div className="p-2 bg-gray-100 rounded-md text-black small">
              {hsCode || '-'}
            </div>
          ) : (
            <>
              <input
                type="text"
                name="hs_code"
                value={hsCode}
                onChange={handleNumberChange}
                inputMode="numeric"
                placeholder="Enter 8-digit HS code"
                maxLength="8"
                className="w-full p-2 custom-border-3 bg-blue-80 rounded-md small focus:outline-none"
              />
              <p className="text-gray-10 xxsmall mt-1">
                HS code must be exactly 8 numeric digits
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
