const WebSocket = require("ws");
const readline = require("readline");

const ws = new WebSocket("ws://localhost:3000");

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let isConnected = false;

console.log("Connecting to WebSocket server...\n");

ws.on("open", () => {
  isConnected = true;
  console.log("Connected to chat server!");
  console.log(
    "Type your message and press Enter to send. Type 'exit' to quit.\n",
  );
  promptUser();
});

ws.on("message", (data) => {
  const message = JSON.parse(data);
  console.log(`\n📨 Received:`);
  if (message.type === "message") {
    console.log(`  ${message.userId}: ${message.text}`);
  } else if (message.type === "system") {
    console.log(`  [SYSTEM] ${message.message}`);
  } else if (message.type === "user_joined") {
    console.log(`  [SYSTEM] ${message.message}`);
  } else if (message.type === "user_left") {
    console.log(`  [SYSTEM] ${message.message}`);
  } else {
    console.log(JSON.stringify(message, null, 2));
  }
  console.log("");
  if (isConnected) promptUser();
});

ws.on("close", () => {
  isConnected = false;
  console.log("\n Disconnected from server");
  process.exit(0);
});

ws.on("error", (error) => {
  console.error(" Error:", error.message);
});

function promptUser() {
  rl.question("You: ", (input) => {
    if (input.toLowerCase() === "exit") {
      ws.close();
      return;
    }

    if (input.trim()) {
      ws.send(JSON.stringify({ text: input }));
    } else if (isConnected) {
      promptUser();
    }
  });
}