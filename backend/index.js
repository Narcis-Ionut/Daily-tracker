const express = require("express");
const axios = require("axios");
const cors = require("cors");
const { spawn } = require("child_process");
const multer = require("multer");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const PORT = 5001;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const uploadDir = path.join(__dirname, "uploads");
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Directory for storing LoRA adapters and training data
const LORA_ADAPTERS_DIR = path.join(__dirname, "lora-adapters");
const TRAINING_DATA_DIR = path.join(__dirname, "training_data");

// Ensure directories exist
(async () => {
  await fs.mkdir(LORA_ADAPTERS_DIR, { recursive: true });
  await fs.mkdir(TRAINING_DATA_DIR, { recursive: true });
})();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

// Chat server state
let currentServer = null;
let currentModel = null;
let isServerSwitching = false;

// Chat server functions
async function isMLXServerRunning() {
  try {
    const response = await axios.get("http://127.0.0.1:8080/v1/models");
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

async function waitForServerReady(attempts = 30, delay = 1000) {
  for (let i = 0; i < attempts; i++) {
    try {
      const response = await axios.get("http://127.0.0.1:8080/v1/models");
      if (response.status === 200) {
        console.log("MLX server is ready");
        return true;
      }
    } catch (error) {
      console.log(`Attempt ${i + 1}: Server not ready yet...`);
    }
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  throw new Error("Server failed to start after maximum attempts");
}

async function getDownloadedModels() {
  const modelsDir = path.join(
    process.env.HOME || process.env.USERPROFILE,
    ".cache",
    "huggingface",
    "hub"
  );
  try {
    const models = [];
    const entries = await fs.readdir(modelsDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory() && entry.name.startsWith("models--")) {
        try {
          const modelPath = path.join(modelsDir, entry.name);
          const modelName = entry.name
            .replace("models--", "")
            .split("--")
            .join("/");

          const dirContents = await fs.readdir(modelPath);
          if (dirContents.length > 0) {
            models.push({
              id: modelName,
              path: modelPath,
            });
          }
        } catch (err) {
          continue;
        }
      }
    }
    return models;
  } catch (err) {
    console.error("Error scanning models directory:", err);
    return [];
  }
}

function startMLXServer(modelName) {
  console.log(`Starting MLX server with model: ${modelName}...`);

  const command = "conda";
  const args = ["run", "-n", "mlx_env", "mlx_lm.server", "--model", modelName];

  const mlxServerProcess = spawn(command, args, {
    shell: true,
    env: process.env,
    cwd: process.cwd(),
  });

  mlxServerProcess.stdout.on("data", (data) => {
    console.log(`MLX Server: ${data}`);
  });

  mlxServerProcess.stderr.on("data", (data) => {
    console.error(`MLX Server Error: ${data}`);
  });

  mlxServerProcess.on("close", (code) => {
    console.log(`MLX Server exited with code ${code}`);
    if (currentServer === mlxServerProcess) {
      currentServer = null;
      currentModel = null;
    }
  });

  return mlxServerProcess;
}

async function switchModel(newModel) {
  if (isServerSwitching) {
    throw new Error("Model switch already in progress");
  }

  isServerSwitching = true;
  try {
    if (currentServer) {
      console.log("Stopping current server...");
      currentServer.kill();
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log(`Starting new server with model: ${newModel}`);
    currentServer = startMLXServer(newModel);
    await waitForServerReady();
    currentModel = newModel;
    console.log("Model switch completed successfully");
  } catch (error) {
    if (currentServer) {
      currentServer.kill();
      currentServer = null;
    }
    currentModel = null;
    throw error;
  } finally {
    isServerSwitching = false;
  }
}

// Chat API Routes
app.get("/downloaded-models", async (req, res) => {
  try {
    const models = await getDownloadedModels();
    res.json({ models });
  } catch (error) {
    console.error("Error getting downloaded models:", error);
    res.status(500).json({
      error: "Failed to retrieve downloaded models",
    });
  }
});

app.post("/chat", async (req, res) => {
  const {
    model,
    messages,
    systemPrompt,
    temperature = 0.7,
    max_tokens = 512,
    stream = true,
  } = req.body;

  try {
    const downloadedModels = await getDownloadedModels();
    const modelExists = downloadedModels.some((m) => m.id === model);

    if (!modelExists) {
      return res.status(400).json({
        error: `Model ${model} is not downloaded.`,
      });
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: "Messages array is required and cannot be empty",
      });
    }

    if (currentModel !== model) {
      try {
        await switchModel(model);
      } catch (error) {
        return res.status(500).json({
          error: "Model switch failed",
          details: error.message,
        });
      }
    }

    let prompt = "";
    if (systemPrompt?.trim()) {
      prompt += `${systemPrompt.trim()}\n`;
    }

    for (const msg of messages) {
      if (!["user", "assistant"].includes(msg.role)) {
        return res.status(400).json({ error: "Invalid message role" });
      }
      prompt += `${msg.role === "user" ? "User: " : "Assistant: "}${
        msg.content
      }\n`;
    }
    prompt += "Assistant:";

    const mlxPayload = {
      model,
      prompt,
      temperature,
      max_tokens,
      stream,
    };

    if (stream) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.flushHeaders();

      const response = await axios({
        method: "post",
        url: "http://127.0.0.1:8080/v1/completions",
        data: mlxPayload,
        responseType: "stream",
      });

      response.data.on("data", (chunk) => res.write(chunk));
      response.data.on("end", () => res.end());
      response.data.on("error", (err) => {
        console.error("Streaming error:", err);
        res.end();
      });
    } else {
      const response = await axios.post(
        "http://127.0.0.1:8080/v1/completions",
        mlxPayload
      );
      res.json(response.data);
    }
  } catch (error) {
    console.error("Error in /chat handler:", error);
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.error || "Internal server error";
    res.status(statusCode).json({ error: errorMessage });
  }
});

// Training routes
app.post("/train-model", upload.single("trainingFile"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Training data file is required" });
  }

  const { model } = req.body;
  const config = JSON.parse(req.body.config);
  const timestamp = Date.now();

  // Create training data directory for this job
  const trainingDir = path.join(TRAINING_DATA_DIR, `training_${timestamp}`);
  const adapterName = `lora-adapter-${timestamp}`;
  const adapterDir = path.join(LORA_ADAPTERS_DIR, adapterName);

  try {
    // Create necessary directories
    await fs.mkdir(trainingDir, { recursive: true });
    await fs.mkdir(adapterDir, { recursive: true });

    // Read and process the uploaded file
    const fileContent = await fs.readFile(req.file.path, "utf8");
    const jsonlData = fileContent.split("\n").filter((line) => line.trim());

    // Split data into train and validation sets (90-10 split)
    const splitIndex = Math.floor(jsonlData.length * 0.9);
    const trainData = jsonlData.slice(0, splitIndex);
    const validData = jsonlData.slice(splitIndex);

    // Write train and validation files
    await fs.writeFile(
      path.join(trainingDir, "train.jsonl"),
      trainData.join("\n")
    );
    await fs.writeFile(
      path.join(trainingDir, "valid.jsonl"),
      validData.join("\n")
    );

    // Clean up original upload
    await fs.unlink(req.file.path);

    const args = [
      "run",
      "-n",
      "mlx_env",
      "mlx_lm.lora",
      "--train",
      "--model",
      model,
      "--data",
      trainingDir,
      "--batch-size",
      config.batchSize.toString(),
      "--num-layers",
      config.loraLayers.toString(),
      "--iters",
      config.iterations.toString(),
      "--adapter-path",
      adapterDir,
      "--fine-tune-type",
      "lora",
    ];

    const trainingProcess = spawn("conda", args, {
      shell: true,
      env: process.env,
      cwd: process.cwd(),
    });

    let output = "";
    let error = "";

    trainingProcess.stdout.on("data", (data) => {
      output += data.toString();
      console.log(`Training output: ${data}`);
    });

    trainingProcess.stderr.on("data", (data) => {
      error += data.toString();
      console.error(`Training error: ${data}`);
    });

    trainingProcess.on("close", async (code) => {
      if (code === 0) {
        // Save training metadata
        const metadata = {
          baseModel: model,
          created: new Date().toISOString(),
          config: config,
          training: {
            output: output,
            completedAt: new Date().toISOString(),
          },
        };

        await fs.writeFile(
          path.join(adapterDir, "metadata.json"),
          JSON.stringify(metadata, null, 2)
        );

        // Clean up training data directory after successful training
        await fs.rm(trainingDir, { recursive: true });

        res.json({
          success: true,
          message: "LoRA adapter training completed successfully",
          adapterName: adapterName,
          metadata: metadata,
        });
      } else {
        // Clean up on failure
        await fs.rm(adapterDir, { recursive: true, force: true });
        await fs.rm(trainingDir, { recursive: true, force: true });

        res.status(500).json({
          error: "Training failed",
          details: error,
        });
      }
    });
  } catch (error) {
    // Clean up on error
    try {
      await fs.rm(trainingDir, { recursive: true, force: true });
      await fs.rm(adapterDir, { recursive: true, force: true });
    } catch (err) {
      console.error("Error during cleanup:", err);
    }

    console.error("Error in model training:", error);
    res.status(500).json({
      error: "Internal server error during model training",
      details: error.message,
    });
  }
});

// LoRA adapter management routes
app.get("/lora-adapters", async (req, res) => {
  try {
    const adapters = [];
    const entries = await fs.readdir(LORA_ADAPTERS_DIR, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        try {
          const metadataPath = path.join(
            LORA_ADAPTERS_DIR,
            entry.name,
            "metadata.json"
          );
          const metadata = JSON.parse(await fs.readFile(metadataPath, "utf-8"));
          adapters.push({
            name: entry.name,
            ...metadata,
          });
        } catch (err) {
          console.error(`Error reading adapter ${entry.name}:`, err);
          continue;
        }
      }
    }

    res.json({ adapters });
  } catch (error) {
    console.error("Error getting LoRA adapters:", error);
    res.status(500).json({
      error: "Failed to retrieve LoRA adapters",
    });
  }
});

app.delete("/lora-adapters/:name", async (req, res) => {
  const adapterPath = path.join(LORA_ADAPTERS_DIR, req.params.name);

  try {
    await fs.rm(adapterPath, { recursive: true, force: true });
    res.json({ success: true, message: "Adapter deleted successfully" });
  } catch (error) {
    console.error("Error deleting adapter:", error);
    res.status(500).json({
      error: "Failed to delete adapter",
      details: error.message,
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
});

// Cleanup function
function cleanup() {
  if (currentServer) {
    console.log("Shutting down MLX server...");
    currentServer.kill();
  }
  process.exit();
}

// Register cleanup handlers
process.on("exit", cleanup);
process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

app.listen(PORT, async () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);

  try {
    const defaultModel = "mlx-community/Llama-3.1-Tulu-3-8B-8bit";
    currentServer = startMLXServer(defaultModel);
    await waitForServerReady();
    currentModel = defaultModel;
    console.log(`Started with default model: ${defaultModel}`);
  } catch (error) {
    console.error("Failed to start default model:", error);
    process.exit(1);
  }
});
