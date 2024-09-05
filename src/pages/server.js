//setting up database connection
const { createClient } = require("@supabase/supabase-js");
const supabaseUrl = "https://umkaqxgnqgsvzngsgpeh.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVta2FxeGducWdzdnpuZ3NncGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjA3MjA5NDYsImV4cCI6MjAzNjI5Njk0Nn0.F2KBWbtCvdNNwfPG0PDetHymgh29_RQPpkASya_KVto";
const supabase = createClient(supabaseUrl, supabaseKey);

//setting up server and websocket
const WebSocket = require("ws");
const express = require("express");
const http = require("http");
const cors = require("cors");
const url = require("url");
const GameServer = require("./gameserver");
const PlayerThread = require("./playerthread");
const port = 3001;
const app = express();
app.use(cors());
app.use(express.json());
const server = http.createServer(app);

const gameServers = {};
const playermap = new Map();
//----------------------------------------------------
const wss = new WebSocket.Server({ server });

wss.on("connection", function connection(ws, req) {
  const parameters = url.parse(req.url, true).query;
  const username = parameters.username;
  console.log(`New connection from ${username}`);
  if (!playermap.has(username)) {
    console.error(`User ${username} not found in playermap.`);
    ws.close();
    return;
  }
  const gameServerName = playermap.get(username).gameServerName;
  gameServer = gameServers[gameServerName];

  const player = new PlayerThread(ws, username, gameServerName, gameServer);

  const playerData = playermap.get(username);
  console.log(playerData);
  playerData.websocket = ws;
  playerData.player = player;
  console.log(playerData);

  if (gameServers[gameServerName]) {
    gameServers[gameServerName].addPlayer(player);
  } else {
    console.error(`Game server ${gameServerName} does not exist.`);
    ws.send('{"type": "error", "message": "Game server not found"}');
    ws.close();
    return;
  }

  ws.on("message", function incoming(message) {
    console.log("received: %s", message);

    console.log(`Received from ${username}: ${message}`);
    try {
      playerData.player.handleMessage(message);
    } catch (error) {
      console.error(`Error handling message from ${username}:`, error);
    }
  });

  // ws.on("close", function () {
  //   console.log(
  //     `GamingPageWebSocket: 1 Disconnecting from ${username} - removing player from game server vector`
  //   );
  //   if (playerData && playerData.player) {
  //     playerData.player.gameServer.removePlayer(playerData.player);
  //   }
  //   playermap.delete(username);
  // });
});

//----------------------------------------------------

app.post("/signup", async (req, res) => {
  const { username, password, confirmPassword, termsAccepted } = req.body;
  if (!termsAccepted) {
    return res
      .status(400)
      .json({ error: "You must accept the terms and conditions." });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match." });
  }
  try {
    let { data: existingUser, error: fetchError } = await supabase
      .from("accounts")
      .select("*")
      .eq("username", username)
      .single();
    if (fetchError && fetchError.code !== "PGRST116") {
      return res
        .status(500)
        .json({ error: "Error checking username. Please try again." });
    }
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Registration failed. Username already exists." });
    }
    const { data, error: insertError } = await supabase
      .from("accounts")
      .insert([{ username, password }]);
    if (insertError) {
      return res
        .status(500)
        .json({ error: "Registration failed. Please try again." });
    }
    res.json({ success: true, username });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

app.post("/hello", async (req, res) => {
  console.log("hello");
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("hellow wolfy :)");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    let { data: account, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("username", username)
      .single();
    if (error || !account) {
      return res.status(400).json({ error: "Invalid username or password" });
    }
    if (account.password === password) {
      res.json({ success: true, username: account.username });
    } else {
      res.status(400).json({ error: "Invalid username or password" });
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    res
      .status(500)
      .json({ error: "Error fetching user data. Please try again." });
  }
});

app.post("/get-user-info", async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: "Username is required." });
  }
  try {
    let { data: account, error } = await supabase
      .from("accounts")
      .select("gamesplayed, gameswon, totalwordstyped, bestwordsperminute")
      .eq("username", username)
      .single(); // Assumes username is unique and returns a single row
    if (error) {
      return res.status(500).json({ error: "Error fetching user data." });
    }
    if (!account) {
      return res.status(404).json({ error: "User not found." });
    }
    res.json({
      gamesPlayed: account.gamesplayed,
      gamesWon: account.gameswon,
      totalWordsTyped: account.totalwordstyped,
      bestWPM: account.bestwordsperminute,
    });
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ error: "An error occurred. Please try again." });
  }
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
      `server.js: game server "${gameServerName}" created with difficulty ${difficulty} and topic "${customTopic}".`
    );
    res.json({ status: "success" });
  } else {
    res.json({ status: "fail", message: "Game server already exists." });
  }
});

app.post("/join-game", (req, res) => {
  const { username, gameServerName } = req.body;
  if (gameServers[gameServerName]) {
    const playerData = {
      username,
      gameServerName,
      websocket: null,
      player: null,
    };
    console.log(username, " joined game server ", gameServerName);
    playermap.set(username, playerData);
    res.json({ status: "success" });
  } else {
    res.json({ status: "fail", message: "Game server does not exist." });
  }
});

app.get("/get-games", (req, res) => {
  const gameServerList = Object.keys(gameServers).map((serverName) => {
    const server = gameServers[serverName];
    return {
      serverName: serverName,
      difficulty: server.difficulty,
      customTopic: server.customTopic,
    };
  });
  res.json(gameServerList);
});

app.post("/generate-prompt", async (req, res) => {
  const { difficulty, customTopic } = req.body;

  const prompt = `Generate a creative prompt with difficulty level ${difficulty} about the topic: ${customTopic}`;
  generatedPrompt = "hello, special prompt";
  res.json({ status: "success", prompt: generatedPrompt });
});

server.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
