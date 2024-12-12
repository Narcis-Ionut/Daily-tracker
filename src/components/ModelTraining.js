import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";

const ModelTraining = () => {
  // State for downloaded models list
  const [downloadedModels, setDownloadedModels] = useState([]);

  // State for form inputs
  const [selectedModel, setSelectedModel] = useState("");
  const [trainingFile, setTrainingFile] = useState(null);
  const [trainingConfig, setTrainingConfig] = useState({
    batchSize: 2,
    loraLayers: 8,
    iterations: 500,
  });

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [trainedAdapters, setTrainedAdapters] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    adapter: null,
  });

  // Fetch available models and adapters on component mount
  useEffect(() => {
    fetchModels();
    fetchAdapters();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await fetch("http://localhost:5001/downloaded-models");
      const data = await response.json();
      setDownloadedModels(data.models || []);
    } catch (err) {
      setError("Failed to fetch available models");
    }
  };

  const fetchAdapters = async () => {
    try {
      const response = await fetch("http://localhost:5001/lora-adapters");
      const data = await response.json();
      setTrainedAdapters(data.adapters || []);
    } catch (err) {
      setError("Failed to fetch trained adapters");
    }
  };

  // Handle training configuration changes
  const handleConfigChange = (field) => (event) => {
    setTrainingConfig((prev) => ({
      ...prev,
      [field]: parseInt(event.target.value),
    }));
  };

  // Handle model selection
  const handleModelSelect = (event) => {
    setSelectedModel(event.target.value);
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setTrainingFile(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("model", selectedModel);
      formData.append("trainingFile", trainingFile);
      formData.append("config", JSON.stringify(trainingConfig));

      const response = await fetch("http://localhost:5001/train-model", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Training failed");
      }

      const result = await response.json();
      setSuccess(result.message);
      fetchAdapters(); // Refresh adapters list

      // Reset form
      setTrainingFile(null);
      setSelectedModel("");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adapter deletion confirmation
  const handleDeleteConfirm = (adapter) => {
    setDeleteDialog({
      open: true,
      adapter: adapter,
    });
  };

  // Handle adapter deletion
  const handleDeleteAdapter = async () => {
    const adapter = deleteDialog.adapter;
    if (!adapter) return;

    try {
      const response = await fetch(
        `http://localhost:5001/lora-adapters/${adapter.name}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete adapter");
      }

      setSuccess("Adapter deleted successfully");
      fetchAdapters(); // Refresh adapters list
    } catch (err) {
      setError(err.message);
    }
    setDeleteDialog({ open: false, adapter: null });
  };

  return (
    <Box
      sx={{
        p: 3,
        backgroundColor: "#0a0f1f",
        minHeight: "100vh",
        color: "#ffffff",
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: 600, color: "#00b4d8" }}
      >
        Model Training
      </Typography>

      {/* Training Form */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 3,
          backgroundColor: "#131b2f",
          borderRadius: "12px",
          color: "#ffffff",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{ fontWeight: 500, color: "#00b4d8" }}
        >
          Train New LoRA Adapter
        </Typography>

        <form onSubmit={handleSubmit}>
          {/* Model Selection */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel sx={{ color: "#b0b8c3" }}>Base Model</InputLabel>
            <Select
              value={selectedModel}
              onChange={handleModelSelect}
              label="Base Model"
              sx={{
                color: "#ffffff",
                ".MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.3)",
                  },
                  "&:hover fieldset": {
                    borderColor: "#00b4d8",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#00b4d8",
                  },
                },
                ".MuiSvgIcon-root": {
                  color: "#ffffff",
                },
              }}
            >
              {downloadedModels.map((model) => (
                <MenuItem key={model.id} value={model.id}>
                  {model.id}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Training Configuration */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              type="number"
              label="Batch Size"
              value={trainingConfig.batchSize}
              onChange={handleConfigChange("batchSize")}
              helperText="Recommended: 2-4 for 16GB RAM. Start with 2"
              inputProps={{ min: 1, max: 8 }}
              sx={{
                mb: 2,
                "& .MuiInputBase-root": {
                  color: "#ffffff",
                },
                "& .MuiFormLabel-root": {
                  color: "#b0b8c3",
                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.3)",
                  },
                  "&:hover fieldset": {
                    borderColor: "#00b4d8",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#00b4d8",
                  },
                },
              }}
            />

            <TextField
              fullWidth
              type="number"
              label="LoRA Layers"
              value={trainingConfig.loraLayers}
              onChange={handleConfigChange("loraLayers")}
              helperText="Recommended: 8 layers for 16GB RAM. Range: 4-16"
              inputProps={{ min: 4, max: 16 }}
              sx={{
                mb: 2,
                "& .MuiInputBase-root": {
                  color: "#ffffff",
                },
                "& .MuiFormLabel-root": {
                  color: "#b0b8c3",
                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.3)",
                  },
                  "&:hover fieldset": {
                    borderColor: "#00b4d8",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#00b4d8",
                  },
                },
              }}
            />

            <TextField
              fullWidth
              type="number"
              label="Training Iterations"
              value={trainingConfig.iterations}
              onChange={handleConfigChange("iterations")}
              helperText="Start with 500 iterations"
              inputProps={{ min: 100 }}
              sx={{
                "& .MuiInputBase-root": {
                  color: "#ffffff",
                },
                "& .MuiFormLabel-root": {
                  color: "#b0b8c3",
                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.3)",
                  },
                  "&:hover fieldset": {
                    borderColor: "#00b4d8",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#00b4d8",
                  },
                },
              }}
            />
          </Box>

          {/* File Upload */}
          <Box sx={{ mb: 3 }}>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{
                borderColor: "rgba(255, 255, 255, 0.3)",
                color: "#ffffff",
                "&:hover": {
                  borderColor: "#00b4d8",
                },
              }}
            >
              {trainingFile ? trainingFile.name : "Upload Training Data"}
              <input
                type="file"
                hidden
                onChange={handleFileSelect}
                accept=".jsonl,.txt,.csv"
              />
            </Button>
          </Box>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isLoading || !selectedModel || !trainingFile}
            sx={{
              backgroundColor: "#00b4d8",
              color: "#ffffff",
              fontWeight: 500,
              "&:hover": {
                backgroundColor: "#0096c7",
              },
            }}
          >
            {isLoading ? (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <CircularProgress size={24} sx={{ mr: 1, color: "#ffffff" }} />
                Training...
              </Box>
            ) : (
              "Start Training"
            )}
          </Button>
        </form>

        {/* Status Messages */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}
      </Paper>

      {/* Trained Adapters List */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          backgroundColor: "#131b2f",
          borderRadius: "12px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{ fontWeight: 500, color: "#00b4d8" }}
        >
          Trained Adapters
        </Typography>

        {trainedAdapters.length > 0 ? (
          <List>
            {trainedAdapters.map((adapter) => (
              <ListItem
                key={adapter.name}
                sx={{
                  backgroundColor: "#192038",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                  mb: 1,
                  "&:hover": {
                    backgroundColor: "#1e2538",
                  },
                }}
              >
                <ListItemText
                  primary={adapter.name}
                  secondary={`Base Model: ${
                    adapter.baseModel
                  } | Created: ${new Date(adapter.created).toLocaleString()}`}
                  sx={{
                    "& .MuiListItemText-primary": {
                      fontWeight: 500,
                      color: "#ffffff",
                    },
                    "& .MuiListItemText-secondary": {
                      color: "#b0b8c3",
                    },
                  }}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDeleteConfirm(adapter)}
                    sx={{ color: "#b0b8c3" }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography color="#b0b8c3">No trained adapters yet</Typography>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, adapter: null })}
      >
        <DialogTitle>Delete Adapter</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this adapter? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialog({ open: false, adapter: null })}
            sx={{ color: "#00b4d8" }}
          >
            Cancel
          </Button>
          <Button onClick={handleDeleteAdapter} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ModelTraining;
