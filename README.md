# WebSocket Chat Application

A basic WebSocket chat server built with Node.js, Express, and the `ws` library.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Server

```bash
npm start
```

The server will run on `ws://localhost:3000`

### 3. Test with Postman

#### Connect to WebSocket:

1. Open **Postman**
2. Create a new request
3. Change the method to **WebSocket**
4. Enter URL: `ws://localhost:3000`
5. Click **Connect**

#### Send a Chat Message:

Once connected, send a JSON message:

```json
{
  "text": "Hello, this is my first message!"
}
```

Or simply send plain text:

```
Hello, everyone!
```

#### Messages You'll Receive:

- **System message** - Welcome notification
- **User joined** - When a user connects
- **Message** - Broadcasted messages from other clients
- **User left** - When a user disconnects

### Server Endpoints

- **WebSocket**: `ws://localhost:3000` - Main chat endpoint
- **HTTP GET** `/` - Server status page
- **HTTP GET** `/status` - JSON status with connected users count

## Message Format

### Sending Messages

```json
{
  "text": "Your message here"
}
```

### Receiving Messages

```json
{
  "type": "message",
  "userId": "1234567890",
  "text": "Your message here",
  "timestamp": "2026-03-02T10:30:00.000Z"
}
```

## Features

- ✅ Multiple client connections
- ✅ Real-time message broadcasting
- ✅ User join/leave notifications
- ✅ Unique user IDs
- ✅ Timestamps on messages
- ✅ Error handling
- ✅ Connection status tracking

## Testing Multiple Connections

To test with multiple users in Postman:

1. Open multiple Postman windows/tabs
2. Connect each to `ws://localhost:3000`
3. Send messages from different clients
4. See messages broadcast to all connected clients
