const express = require("express");
const WebSocket = require("ws");
const GameServer = require("./gameserver");

const app = express();
const port = process.env.PORT || 3000;

// Middleware for JSON parsing
app.use(express.json());

// Game server state
const gameServers = {};

// WebSocket server
const wss = new WebSocket.Server({ noServer: true });

wss.on("connection", (ws, request, user) => {
  console.log(`New connection for user: ${user.username}`);

  ws.on("message", (message) => {
    console.log(`Received message from ${user.username}: ${message}`);
    // Handle messages from client
  });

  ws.on("close", () => {
    console.log(`Connection closed for user: ${user.username}`);
    // Clean up on close
  });
});

// Simple middleware to parse user info from request
app.use((req, res, next) => {
  req.user = { username: "guest" }; // Example static user, replace with session/jwt logic
  next();
});

app.get("/game/:gameServerName", (req, res) => {
  const gameServerName = req.params.gameServerName;
  if (!gameServers[gameServerName]) {
    gameServers[gameServerName] = { players: [] }; // Initialize a new game server
  }
  res.json({ status: "success", gameServerName });
});

app.post("/create-game", (req, res) => {
  const { gameServerName, difficulty, customTopic } = req.body;

  if (!gameServers[gameServerName]) {
    const newGameServer = new GameServer(
      gameServerName,
      difficulty,
      customTopic
    );
    gameServers[gameServerName] = newGameServer;

    console.log(
      `Game server "${gameServerName}" created with difficulty ${difficulty} and topic "${customTopic}".`
    );

    res.json({ status: "success" });
  } else {
    res.json({ status: "fail", message: "Game server already exists." });
  }
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
