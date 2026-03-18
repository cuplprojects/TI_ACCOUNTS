export default function Status({ formData, commonAttributes, handleInputChange, isViewMode = false }) {
  const status = formData.has_variations ? commonAttributes.status : formData.status;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm custom-border-1">
      <h3 className="text-black title-4-semibold mb-4">Status</h3>
      
      <div className="mb-6">
        <label className="block text-black title-4-semibold mb-2">
          Product Status
        </label>
        {isViewMode ? (
          <div className="p-2 bg-gray-100 rounded-md text-black small capitalize">
            {status}
          </div>
        ) : (
          <select
            name="status"
            value={status}
            onChange={handleInputChange}
            className="w-full p-2 custom-border-3 bg-blue-80 rounded-md small focus:outline-none"
          >
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="approvalpending">Approval Pending</option>
            <option value="inactive">Inactive</option>
          </select>
        )}
      </div>
    </div>
  );
}
