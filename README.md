LocalChat: Your Local LLM-Powered Chat Interface

Hello , welcome to the LocalChat README! Here you’ll find step-by-step instructions to get the app up and running on your own computer. This app provides a local chat interface that communicates with a locally hosted MLX (Machine Learning Exchange) model server. You can interact with different language models, customize prompts, save and load conversations, and even perform LoRA adapter training for model fine-tuning—all from a local environment.

What Is This App?

LocalChat is a web application that:
• Runs locally: No external API keys needed—everything stays on your machine.
• Manages chats: Create multiple chat sessions, rename them, delete old ones, and store all chats in a local SQLite database.
• Interfaces with MLX models: Dynamically switch between different downloaded Hugging Face models. The backend can start, stop, and switch models at runtime.
• Custom system prompts and parameters: Adjust the system prompt and model parameters (temperature, etc.) on the fly.
• Train LoRA adapters: Upload training data to fine-tune models using LoRA (Low-Rank Adaptation) directly from the app.

Think of this as your own mini-ChatGPT environment that you control and can customize.

Technologies Used
• Frontend: React (served via npm start on localhost:3000)
• Backend: Node.js + Express (running on localhost:5001)
• ML Model Server: MLX (Machine Learning Exchange) server (running on localhost:8080) spawned by a conda environment
• Database: SQLite for storing chat history
• Python & Conda: mlx_lm commands are run in a conda environment named mlx_env
• LoRA Training: Utilities for fine-tuning models

Prerequisites
• Conda: You’ll need Anaconda or Miniconda installed to manage the Python environment.
• Node.js (LTS): For running the frontend and backend.
• Git: To clone the repository.
• Port availability: Make sure ports 3000, 5001, and 8080 are free.

ADHD-friendly Tip: Don’t worry if this looks like a lot. Just go step-by-step. It’s okay to take breaks. Focus on one part at a time!

Setup Steps

1. Clone This Repository

git clone https://github.com/YOUR-USERNAME/LocalChat.git
cd LocalChat

2. Set Up the Conda Environment

You need to create and activate a conda environment (mlx_env) that includes mlx_lm (the tool used to run models locally).

Example Installation Steps: 1. Create and activate environment:

conda create -n mlx_env python=3.9 -y
conda activate mlx_env

    2.	Install mlx_lm and dependencies:

Depending on your setup, you might have a requirements file or need to install mlx_lm from a known source. For example:

pip install mlx-lm

If you have a requirements.txt file in your repo, you can do:

pip install -r requirements.txt

If no direct instructions are given, check the mlx_lm documentation for installation steps.

3. Verify MLX Server Tooling

Check that mlx_lm.server command is accessible:

mlx_lm.server --help

If it prints a help message, you’re good. If not, ensure mlx_lm is installed correctly in mlx_env.

4. Install Node.js Dependencies (Frontend & Backend)

Open a new terminal window (but keep the environment in mind—Node.js doesn’t need conda):

cd LocalChat
npm install

This installs React frontend and Node.js backend dependencies.

ADHD-friendly Tip: Installing packages might take a bit; it’s okay to do something else while you wait.

5. Running the Backend
   1. Stay in your main terminal window where you’ve done npm install.
   2. Start the backend server:

node backend.js

Where backend.js is the main server file. If the backend file is named differently (e.g., server.js), adjust the command accordingly.
The backend runs on http://localhost:5001.
Upon startup, the backend:
• Creates an SQLite database chats.db if not present.
• Attempts to start the MLX server with a default model (e.g., mlx-community/Llama-3.1-Tulu-3-8B-8bit).
• Waits for the MLX server to be ready.

If you see logs like “MLX Server is ready,” you’re good to go!

6. Running the Frontend

Open another terminal window (so you have two now: one for backend, one for frontend):

npm start

This should automatically open http://localhost:3000 in your browser. If it doesn’t, open it manually.

7. Interacting With the App
   • Main UI: The web interface shows a sidebar with chat sessions, a prompt setter, a model selector, and a message area.
   • Change Models: Use the dropdown to select a different model. The backend will handle switching.
   • System Prompt: Set a custom prompt for the assistant. The assistant will then respond according to this personality.
   • Save/Load Chats: Your conversations are automatically saved in a local SQLite database.

ADHD-friendly Tip: Explore at your own pace. Don’t worry about messing anything up—this is your local environment.

8. Training a LoRA Adapter (Optional, Advanced)
   • Navigate to the training section (in the frontend UI) and upload a JSONL file with your training data.
   • Specify training parameters (like batch size, iterations).
   • The backend will run mlx_lm.lora commands to create a LoRA adapter directory.
   • After completion, your LoRA adapter appears in the list. You can apply it to fine-tune responses.

Note: This step is more advanced. Don’t stress if it’s confusing at first—take your time, and maybe return to it later.

9. Troubleshooting
   • MLX Server not starting?
   Make sure you’re in the mlx_env environment and that mlx_lm is installed. Check firewall or security settings that may block local ports.
   • Models not found?
   The code expects models cached in ~/.cache/huggingface/hub/models--.... Download or place your Hugging Face models into the cache directory. Or run mlx_lm commands to download a model:

mlx_lm.server --model <huggingface-model-id>

Wait until the model is fully downloaded, then restart the backend.

    •	Frontend errors?

Refresh the browser. Check console logs. If needed, stop and restart npm start.

10. Stopping the App
    • Stop Frontend: Press Ctrl + C in the terminal running npm start.
    • Stop Backend & MLX Server: Press Ctrl + C in the terminal running the backend. This also stops the spawned MLX server.

You can resume later by following steps 5 and 6 again.
