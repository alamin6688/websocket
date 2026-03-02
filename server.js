const express = require("express");
const WebSocket = require("ws");
const http = require("http");

const app = express();
const port = 3000;

// Middleware
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store connected clients and messages
const clients = new Map();
const messageHistory = [];
const MAX_HISTORY = 50;

// Basic HTTP endpoint
app.get("/", (req, res) => {
  res.send(
    "WebSocket Chat Server Is Running. Connected via WebSocket at ws://localhost:3000 or use REST API",
  );
});

app.get("/status", (req, res) => {
  res.json({
    connected_users: clients.size,
    total_messages: messageHistory.length,
    message: "Server is running",
  });
});

// REST API: Send a message via Postman
app.post("/api/message", (req, res) => {
  const { text, username = "Anonymous" } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Text field is required!" });
  }

  const userId = `REST-${Date.now()}`;
  const message = {
    type: "message",
    userId: userId,
    username: username,
    text: text,
    timestamp: new Date().toISOString(),
  };

  // Store in history
  messageHistory.push(message);
  if (messageHistory.length > MAX_HISTORY) {
    messageHistory.shift();
  }

  // Broadcast to WebSocket clients
  broadcastMessage(message);

  console.log(`Message via REST API from ${username}:`, text);
  res.json({ success: true, message: message });
});

// REST API: Get messages
app.get("/api/messages", (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : 10;
  const messages = messageHistory.slice(-limit);
  res.json({
    total: messageHistory.length,
    messages: messages,
  });
});

// REST API: Get connected users
app.get("/api/users", (req, res) => {
  const userList = Array.from(clients.keys());
  res.json({
    connected_users: userList.length,
    users: userList,
  });
});

// WebSocket connection handler
wss.on("connection", (ws) => {
    console.log(ws);
  const userId = Date.now().toString();
  clients.set(userId, ws);

  console.log(`Client connected: ${userId} (Total: ${clients.size})`);

  // Send welcome message to new client
  ws.send(
    JSON.stringify({
      type: "system",
      message: `Welcome! You are user ${userId}`,
      timestamp: new Date().toISOString(),
    }),
  );

  // Broadcast user joined
  broadcastMessage({
    type: "user_joined",
    userId: userId,
    message: `User ${userId} joined the chat`,
    timestamp: new Date().toISOString(),
    totalUsers: clients.size,
  });

  // Handle incoming messages
  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data);

      console.log(`Message from ${userId}:`, message);

      // Create message object
      const chatMessage = {
        type: "message",
        userId: userId,
        text: message.text || message,
        timestamp: new Date().toISOString(),
      };

      // Store in history
      messageHistory.push(chatMessage);
      if (messageHistory.length > MAX_HISTORY) {
        messageHistory.shift();
      }

      // Broadcast message to all clients
      broadcastMessage(chatMessage);
    } catch (error) {
      console.error("Error parsing message:", error);
      ws.send(
        JSON.stringify({
          type: "error",
          message: "Invalid message format. Send JSON with text field.",
        }),
      );
    }
  });

  // Handle client disconnect
  ws.on("close", () => {
    clients.delete(userId);
    console.log(`Client disconnected: ${userId} (Total: ${clients.size})`);

    // Broadcast user left
    broadcastMessage({
      type: "user_left",
      userId: userId,
      message: `User ${userId} left the chat`,
      timestamp: new Date().toISOString(),
      totalUsers: clients.size,
    });
  });

  // Handle errors
  ws.on("error", (error) => {
    console.error(`WebSocket error for ${userId}:`, error);
  });
});

// Function to broadcast message to all connected clients
function broadcastMessage(message) {
  const data = JSON.stringify(message);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

// Start server
server.listen(port, () => {
  console.log(`WebSocket Chat Server running on ws://localhost:${port}`);
  console.log(`HTTP Status endpoint: http://localhost:${port}/status`);
});