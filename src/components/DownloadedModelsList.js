import React, { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";

const DownloadedModels = ({ currentModel, onModelSelect, isLoading }) => {
  const [models, setModels] = useState([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [error, setError] = useState(null);

  const fetchModels = async () => {
    setLoadingModels(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:5001/downloaded-models");
      if (!response.ok) {
        throw new Error("Failed to fetch models");
      }
      const data = await response.json();
      setModels(data.models || []);
    } catch (err) {
      setError("Failed to load models");
      console.error("Error fetching models:", err);
    } finally {
      setLoadingModels(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  return (
    <div className="model-selector-wrapper">
      <div className="model-selector-header">
        <select
          value={currentModel}
          onChange={(e) => onModelSelect(e.target.value)}
          disabled={isLoading || loadingModels}
          className="model-select"
        >
          <option value="">Select a model</option>
          {models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.id}
            </option>
          ))}
        </select>
        <button
          onClick={fetchModels}
          disabled={loadingModels || isLoading}
          className="refresh-button"
        >
          <RefreshCw className={loadingModels ? "spin" : ""} />
        </button>
      </div>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default DownloadedModels;
