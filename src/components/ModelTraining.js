import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Paper,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const ModelTraining = () => {
  const [modelRepo, setModelRepo] = useState("");
  const [quantizationType, setQuantizationType] = useState("none");
  const [trainingData, setTrainingData] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  // Configuration state for LoRA training
  const [loraConfig, setLoraConfig] = useState({
    batchSize: 4,
    loraLayers: 8,
    iterations: 1000,
  });

  const quantizationOptions = [
    { value: "none", label: "No Quantization" },
    { value: "q4", label: "4-bit Quantization (Q4)" },
    { value: "q8", label: "8-bit Quantization (Q8)" },
  ];

  const handleConvertModel = async () => {
    if (!modelRepo.trim()) {
      setError("Please enter a model repository");
      return;
    }

    setIsConverting(true);
    setError("");
    setStatus("Converting model...");

    try {
      const response = await fetch("http://localhost:5001/convert-model", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hfPath: modelRepo,
          quantization: quantizationType,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setStatus("Model converted successfully!");
    } catch (err) {
      setError(`Failed to convert model: ${err.message}`);
    } finally {
      setIsConverting(false);
    }
  };

  const handleTrainModel = async () => {
    if (!trainingData) {
      setError("Please upload training data");
      return;
    }

    setIsTraining(true);
    setError("");
    setStatus("Training model with LoRA...");

    try {
      const formData = new FormData();
      formData.append("trainingData", trainingData);
      formData.append("config", JSON.stringify(loraConfig));

      const response = await fetch("http://localhost:5001/train-model", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setStatus("Model training completed successfully!");
    } catch (err) {
      setError(`Failed to train model: ${err.message}`);
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <Box sx={{ maxWidth: "800px", margin: "auto", p: 2 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Model Training & Conversion
        </Typography>

        {/* Model Conversion Section */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Convert Model
            </Typography>

            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Hugging Face Model Repository"
                value={modelRepo}
                onChange={(e) => setModelRepo(e.target.value)}
                margin="normal"
                variant="outlined"
              />

              <FormControl fullWidth margin="normal">
                <InputLabel>Quantization Type</InputLabel>
                <Select
                  value={quantizationType}
                  onChange={(e) => setQuantizationType(e.target.value)}
                  label="Quantization Type"
                >
                  {quantizationOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleConvertModel}
                disabled={isConverting}
                sx={{ mt: 2 }}
                startIcon={isConverting ? <CircularProgress size={20} /> : null}
              >
                {isConverting ? "Converting..." : "Convert Model"}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* LoRA Training Section */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Train with LoRA
            </Typography>

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                type="number"
                label="Batch Size"
                value={loraConfig.batchSize}
                onChange={(e) =>
                  setLoraConfig((prev) => ({
                    ...prev,
                    batchSize: parseInt(e.target.value),
                  }))
                }
                margin="normal"
              />

              <TextField
                fullWidth
                type="number"
                label="LoRA Layers"
                value={loraConfig.loraLayers}
                onChange={(e) =>
                  setLoraConfig((prev) => ({
                    ...prev,
                    loraLayers: parseInt(e.target.value),
                  }))
                }
                margin="normal"
              />

              <TextField
                fullWidth
                type="number"
                label="Training Iterations"
                value={loraConfig.iterations}
                onChange={(e) =>
                  setLoraConfig((prev) => ({
                    ...prev,
                    iterations: parseInt(e.target.value),
                  }))
                }
                margin="normal"
              />
            </Box>

            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              sx={{ mb: 2, width: "100%" }}
            >
              Upload Training Data
              <input
                type="file"
                hidden
                onChange={(e) => setTrainingData(e.target.files[0])}
              />
            </Button>
            {trainingData && (
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Selected file: {trainingData.name}
              </Typography>
            )}

            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleTrainModel}
              disabled={isTraining || !trainingData}
              startIcon={isTraining ? <CircularProgress size={20} /> : null}
            >
              {isTraining ? "Training..." : "Start Training"}
            </Button>
          </CardContent>
        </Card>

        {/* Status and Error Messages */}
        <Box sx={{ mt: 2 }}>
          {status && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {status}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default ModelTraining;
