const express = require("express");
const axios = require("axios");
const cors = require("cors");
const { spawn } = require("child_process");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5001;

// Define supported models
const SUPPORTED_MODELS = [
  "mlx-community/Llama-3.1-Tulu-3-8B-8bit",
  "mlx-community/mistral-7b-instruct-v0.1",
  "mlx-community/neural-chat-7b-v3-1",
];

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

// Server state management
let currentServer = null;
let currentModel = null;
let isServerSwitching = false;

// Helper function to check if MLX server is running
async function isMLXServerRunning() {
  try {
    const response = await axios.get("http://127.0.0.1:8080/v1/models");
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

// Helper function to wait for server to be ready
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

// Function to start the MLX server with a specific model
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

// Function to safely switch models
async function switchModel(newModel) {
  if (isServerSwitching) {
    throw new Error("Model switch already in progress");
  }

  isServerSwitching = true;
  try {
    if (currentServer) {
      console.log("Stopping current server...");
      currentServer.kill();
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for cleanup
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

// Chat endpoint
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
    // Validate model
    if (!SUPPORTED_MODELS.includes(model)) {
      return res.status(400).json({
        error:
          "Invalid model name. Supported models: " +
          SUPPORTED_MODELS.join(", "),
      });
    }

    // Validate messages
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: "Messages array is required and cannot be empty",
      });
    }

    // Handle model switching if needed
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

    // Construct the prompt
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

    // Prepare MLX request payload
    const mlxPayload = {
      model,
      prompt,
      temperature,
      max_tokens,
      stream,
    };

    // Handle streaming vs non-streaming response
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

// Model conversion endpoint
app.post("/convert-model", async (req, res) => {
  const { hfPath, quantize } = req.body;

  if (!hfPath) {
    return res.status(400).json({ error: "Model path is required" });
  }

  try {
    const args = [
      "run",
      "-n",
      "mlx_env",
      "mlx_lm.convert",
      "--hf-path",
      hfPath,
    ];

    if (quantize) {
      args.push("--quantize");
    }

    const convertProcess = spawn("conda", args, {
      shell: true,
      env: process.env,
      cwd: process.cwd(),
    });

    let output = "";
    let error = "";

    convertProcess.stdout.on("data", (data) => {
      output += data.toString();
      console.log(`Convert output: ${data}`);
    });

    convertProcess.stderr.on("data", (data) => {
      error += data.toString();
      console.error(`Convert error: ${data}`);
    });

    convertProcess.on("close", (code) => {
      if (code === 0) {
        res.json({
          success: true,
          message: "Model converted successfully",
          output,
        });
      } else {
        res.status(500).json({
          error: `Conversion failed with code ${code}`,
          details: error,
        });
      }
    });
  } catch (error) {
    console.error("Error in model conversion:", error);
    res.status(500).json({
      error: "Internal server error during model conversion",
    });
  }
});

// Model training endpoint
app.post("/train-model", upload.single("trainingData"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Training data file is required" });
  }

  const config = JSON.parse(req.body.config);
  const trainingDataPath = req.file.path;

  try {
    const args = [
      "run",
      "-n",
      "mlx_env",
      "mlx_lm.lora",
      "--train",
      "--model",
      SUPPORTED_MODELS[0],
      "--data",
      trainingDataPath,
      "--batch-size",
      config.batchSize.toString(),
      "--lora-layers",
      config.loraLayers.toString(),
      "--iters",
      config.iterations.toString(),
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

    trainingProcess.on("close", (code) => {
      // Clean up the uploaded file
      fs.unlinkSync(trainingDataPath);

      if (code === 0) {
        res.json({
          success: true,
          message: "Model training completed successfully",
          output,
        });
      } else {
        res.status(500).json({
          error: `Training failed with code ${code}`,
          details: error,
        });
      }
    });
  } catch (error) {
    // Clean up the uploaded file in case of error
    if (fs.existsSync(trainingDataPath)) {
      fs.unlinkSync(trainingDataPath);
    }
    console.error("Error in model training:", error);
    res.status(500).json({
      error: "Internal server error during model training",
    });
  }
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
});

// Cleanup function for server shutdown
function cleanup() {
  if (currentServer) {
    console.log("Shutting down MLX server...");
    currentServer.kill();
  }
  process.exit();
}

// Handle termination signals
process.on("exit", cleanup);
process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

// Start the server
app.listen(PORT, async () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);

  // Start with default model
  try {
    const defaultModel = SUPPORTED_MODELS[0];
    currentServer = startMLXServer(defaultModel);
    await waitForServerReady();
    currentModel = defaultModel;
    console.log(`Started with default model: ${defaultModel}`);
  } catch (error) {
    console.error("Failed to start default model:", error);
    process.exit(1);
  }
});
