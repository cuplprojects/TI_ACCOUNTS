export default function HSNValidator({ enableHSNValidator, setEnableHSNValidator }) {
  return (
    <div className="p-4 bg-blue-40 border border-blue-20 rounded-md">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-semibold text-blue-00 mb-1">
            Enable HSN Validation
          </label>
          <p className="text-xs text-blue-10">
            Validate HSN code via API (default: Disabled)
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEnableHSNValidator(!enableHSNValidator)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            enableHSNValidator ? 'bg-green-10' : 'bg-gray-20'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
              enableHSNValidator ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );
}
