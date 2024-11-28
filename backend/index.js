const express = require("express");
const { spawn } = require("child_process");
const path = require("path");
const cors = require("cors"); // Import the cors package
const fetch = require("node-fetch"); // Ensure node-fetch is installed

const app = express();
const PORT = 5001; // Backend server port

let ollamaProcess = null; // Standardized variable name

// Middleware to parse JSON
app.use(express.json());

// Configure CORS to allow requests from http://localhost:3000
app.use(
  cors({
    origin: "http://localhost:3000", // React frontend URL
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

/**
 * Function to start the ollama serve process
 */
const startOllamaServe = () => {
  if (!ollamaProcess) {
    console.log("Starting ollama serve...");

    // Replace 'ollama' with the full path if necessary, e.g., '/usr/local/bin/ollama'
    ollamaProcess = spawn("ollama", ["serve"], {
      cwd: path.resolve(__dirname), // Adjust if needed
      stdio: "inherit", // Inherit stdio to see ollama logs in the terminal
      shell: true, // Use shell to allow command execution
    });

    ollamaProcess.on("close", (code) => {
      console.log(`ollama serve exited with code ${code}`);
      ollamaProcess = null;
    });

    ollamaProcess.on("error", (err) => {
      console.error("Failed to start ollama serve:", err);
      ollamaProcess = null;
    });
  } else {
    console.log("ollama serve is already running.");
  }
};

// Endpoint to ensure ollama serve is running
app.get("/api/start-ollama", (req, res) => {
  startOllamaServe();
  res.sendStatus(200);
});

// Proxy endpoint to forward chat requests to ollama serve
app.post("/api/chat", async (req, res) => {
  // Ensure ollama serve is running
  if (!ollamaProcess) {
    console.log("ollama serve is not running. Starting it now...");
    startOllamaServe();

    // Wait briefly to ensure ollama serve has started
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  // Forward the request to ollama serve
  try {
    const response = await fetch("http://127.0.0.1:11434/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      throw new Error(`ollama API responded with status ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error forwarding request to ollama serve:", error);
    res
      .status(500)
      .json({ error: "Failed to communicate with the model server." });
  }
});

// Handle graceful shutdown
const shutdown = () => {
  console.log("Shutting down server...");
  if (ollamaProcess) {
    ollamaProcess.kill("SIGINT");
    console.log("ollama serve process terminated.");
  }
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// Start the backend server
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
