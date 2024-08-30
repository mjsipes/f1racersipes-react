const { v4: uuidv4 } = require("uuid");

class GameServer {
  constructor(name, difficulty, customTopic) {
    this.name = name;
    this.difficulty = difficulty;
    this.customTopic = customTopic;
    this.prompt = "loading prompt...";
    this.start = false;
    this.stop = false;
    this.players = new Set();
    console.log(`gameserver.js: ${this.name} - initializing...`);

    this.init();
  }

  async init() {
    console.log(`gameserver.js: ${this.name} - generating prompt`);
    this.prompt = await this.generatePrompt();
    this.sendAll("prompt", this.prompt);
    this.startGame();
  }

  async generatePrompt() {
    const difficulty = parseInt(this.difficulty);
    const customTopic = this.customTopic;

    try {
      const response = await fetch("http://localhost:3001/generate-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ difficulty, customTopic }),
      });

      const data = await response.json();
      if (data.status === "success") {
        return data.prompt;
      } else {
        console.error(`Error generating prompt: ${data.message}`);
        return `Error: ${data.message}`;
      }
    } catch (error) {
      console.error("Error fetching prompt:", error);
      return "Error: Could not generate prompt.";
    }
  }

  addPlayer(player) {
    console.log(
      `gameserver.js: ${this.name} - adding player ${player.username}`
    );
    this.players.add(player);
  }

  removePlayer(player) {
    console.log(
      `gameserver.js: ${this.name} - removing player ${player.username}`
    );
    this.players.delete(player);
    if (this.players.size === 0) {
      // Remove this game server from global list
      delete global.gameServers[this.name];
    }
  }

  startGame() {
    console.log(`gameserver.js: ${this.name} - starting game`);
    this.start = true;
    this.sendAll("gameStart", true);

    // Simulate game loop with a timeout
    setTimeout(() => {
      this.stopGame();
    }, 60000); // Stop game after 60 seconds (example)
  }

  stopGame() {
    console.log(`gameserver.js: ${this.name} - stopping game`);
    this.stop = true;
    this.sendAll("gameStop", this.stop);
    console.log(`gameserver.js: ${this.name} - game server terminated`);
  }

  sendPositionUpdate() {
    console.log("gameserver.js: sending position update");
    const statuses = Array.from(this.players).map((player) => ({
      serverName: player.username,
      gameStatus: String(player.percentComplete),
    }));

    const jsonResponse = JSON.stringify(statuses);
    this.sendAll("carPosition", jsonResponse);
  }

  sendAll(type, value) {
    console.log(`gameserver.js: sending to all - ${type} - ${value}`);
    this.players.forEach((player) => {
      player.send(type, value);
    });
  }
}

module.exports = GameServer;
