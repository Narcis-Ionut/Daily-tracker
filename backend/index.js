const express = require("express");
const axios = require("axios");
const cors = require("cors");
const { spawn } = require("child_process");

const app = express();
const PORT = 5001;

// Define supported models
const SUPPORTED_MODELS = [
  "mlx-community/Llama-3.1-Tulu-3-8B-8bit",
  "mlx-community/mistral-7b-instruct-v0.1",
  "mlx-community/neural-chat-7b-v3-1",
];

// Middleware to parse JSON
app.use(express.json());

// Configure CORS
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

// Function to check if MLX server is running
async function isMLXServerRunning() {
  try {
    const response = await axios.get("http://127.0.0.1:8080/v1/models");
    return response.status === 200;
  } catch (error) {
    return false;
  }
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
  });

  // Handle termination signals
  process.on("exit", () => {
    mlxServerProcess.kill();
  });
  process.on("SIGINT", () => {
    mlxServerProcess.kill();
    process.exit();
  });
  process.on("SIGTERM", () => {
    mlxServerProcess.kill();
    process.exit();
  });

  return mlxServerProcess;
}

// Map to store running model servers
let currentServer = null;
let currentModel = null;

// Endpoint to handle MLX chat requests
app.post("/chat", async (req, res) => {
  const { model, messages, systemPrompt, temperature, max_tokens, stream } =
    req.body;

  // Validate model
  if (!SUPPORTED_MODELS.includes(model)) {
    return res.status(400).json({
      error:
        "Invalid model name. Supported models: " + SUPPORTED_MODELS.join(", "),
    });
  }

  // Check if we need to switch models
  if (currentModel !== model) {
    console.log(`Switching model from ${currentModel} to ${model}`);

    // Kill current server if it exists
    if (currentServer) {
      currentServer.kill();
    }

    // Start new server with requested model
    currentServer = startMLXServer(model);
    currentModel = model;

    // Wait for server to start (you might want to implement a more robust check)
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  // Validate messages
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({
      error: "Messages array is required and cannot be empty",
    });
  }

  // Construct the prompt string
  let prompt = "";

  // Include systemPrompt if provided
  if (systemPrompt && systemPrompt.trim() !== "") {
    prompt += `${systemPrompt.trim()}\n`;
  }

  for (let msg of messages) {
    if (msg.role === "user") {
      prompt += `User: ${msg.content}\n`;
    } else if (msg.role === "assistant") {
      prompt += `Assistant: ${msg.content}\n`;
    } else {
      return res.status(400).json({ error: "Invalid message role" });
    }
  }

  prompt += "Assistant:";

  // Build the payload for MLX server
  const mlxPayload = {
    model,
    prompt,
    temperature: temperature !== undefined ? temperature : 0.7,
    max_tokens: max_tokens !== undefined ? max_tokens : 512,
    stream: stream !== undefined ? stream : false,
  };

  try {
    if (mlxPayload.stream) {
      // Handle streaming response
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.flushHeaders();

      const response = await axios({
        method: "post",
        url: "http://127.0.0.1:8080/v1/completions",
        data: mlxPayload,
        responseType: "stream",
      });

      response.data.on("data", (chunk) => {
        res.write(chunk);
      });

      response.data.on("end", () => {
        res.end();
      });

      response.data.on("error", (err) => {
        console.error("Error in streaming response:", err);
        res.end();
      });
    } else {
      // Handle non-streaming response
      const response = await axios.post(
        "http://127.0.0.1:8080/v1/completions",
        mlxPayload
      );
      res.json(response.data);
    }
  } catch (error) {
    console.error("Error in /chat handler:", error);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Start the backend server
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);

  // Start with default model
  const defaultModel = SUPPORTED_MODELS[0];
  currentServer = startMLXServer(defaultModel);
  currentModel = defaultModel;
});
