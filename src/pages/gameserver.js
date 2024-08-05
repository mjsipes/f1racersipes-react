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
    console.log(`GameServer: ${this.name} - initializing...`);

    this.init();
  }

  init() {
    console.log(`GameServer: ${this.name} - generating prompt`);
    this.prompt = this.generatePrompt(
      parseInt(this.difficulty),
      this.customTopic
    );
    this.sendAll("prompt", this.prompt);
    console.log(`GameServer: ${this.name} - prompt generated: ${this.prompt}`);
    // Start game logic
    this.startGame();
  }

  generatePrompt(difficulty, customTopic) {
    // Placeholder for prompt generation logic
    return `Generated prompt with difficulty ${difficulty} and topic ${customTopic}`;
  }

  addPlayer(player) {
    console.log(`GameServer: ${this.name} - adding player ${player.userName}`);
    this.players.add(player);
  }

  removePlayer(player) {
    console.log(
      `GameServer: ${this.name} - removing player ${player.userName}`
    );
    this.players.delete(player);
    if (this.players.size === 0) {
      // Remove this game server from global list
      delete global.gameServers[this.name];
    }
  }

  startGame() {
    console.log(`GameServer: ${this.name} - starting game`);
    this.start = true;
    this.sendAll("gameStart", true);

    // Simulate game loop with a timeout
    setTimeout(() => {
      this.stopGame();
    }, 60000); // Stop game after 60 seconds (example)
  }

  stopGame() {
    console.log(`GameServer: ${this.name} - stopping game`);
    this.stop = true;
    this.sendAll("gameStop", this.stop);
    console.log(`GameServer: ${this.name} - game server terminated`);
  }

  sendPositionUpdate() {
    console.log("GameServer: sending position update");
    const statuses = Array.from(this.players).map((player) => ({
      serverName: player.userName,
      gameStatus: String(player.percentComplete),
    }));

    const jsonResponse = JSON.stringify(statuses);
    this.sendAll("carPosition", jsonResponse);
  }

  sendAll(type, value) {
    console.log(`GameServer: sending to all - ${type} - ${value}`);
    this.players.forEach((player) => {
      player.send(type, value);
    });
  }
}

module.exports = GameServer;
