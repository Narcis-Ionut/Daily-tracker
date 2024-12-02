const express = require("express");
const axios = require("axios");
const cors = require("cors");
const { spawn } = require("child_process");

const app = express();
const PORT = 5001; // Backend server port

// Middleware to parse JSON
app.use(express.json());

// Configure CORS to allow requests from local React frontend
app.use(
  cors({
    origin: "http://localhost:3000", // React frontend URL
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

// Function to start the MLX server
function startMLXServer() {
  console.log("Starting MLX server...");

  // Command to run
  const command = "conda";
  const args = [
    "run",
    "-n",
    "mlx_env",
    "mlx_lm.server",
    "--model",
    "mlx-community/Llama-3.1-Tulu-3-8B-8bit",
  ];

  // Spawn the MLX server process
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

  // Handle termination signals to gracefully shut down the MLX server
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
}

// Start the MLX server if not running
isMLXServerRunning().then((running) => {
  if (!running) {
    startMLXServer();
  } else {
    console.log("MLX server is already running.");
  }
});

// Endpoint to handle MLX chat requests
app.post("/chat", async (req, res) => {
  const { model, messages, systemPrompt, temperature, max_tokens, stream } =
    req.body;

  // Validate model
  if (model !== "mlx-community/Llama-3.1-Tulu-3-8B-8bit") {
    return res.status(400).json({ error: "Invalid model name" });
  }

  // Validate messages
  if (!Array.isArray(messages) || messages.length === 0) {
    return res
      .status(400)
      .json({ error: "Messages array is required and cannot be empty" });
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
  // Add "Assistant:" to indicate the assistant should respond next
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
      // Set headers for Server-Sent Events (SSE)
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.flushHeaders(); // Flush the headers to establish SSE with client

      // Send request to MLX server
      const response = await axios({
        method: "post",
        url: "http://127.0.0.1:8080/v1/completions",
        data: mlxPayload,
        responseType: "stream",
      });

      response.data.on("data", (chunk) => {
        // Forward each data chunk to the frontend
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

      // Forward the response to the frontend
      res.json(response.data);
    }
  } catch (error) {
    console.error("Error in /chat handler:", error);
    if (error.response) {
      // If MLX server returned an error response
      res.status(error.response.status).json(error.response.data);
    } else {
      // Other errors (e.g., network issues)
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Start the backend server
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
