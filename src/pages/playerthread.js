const WebSocket = require("ws");
const EventEmitter = require("events");
const { v4: uuidv4 } = require("uuid");

class PlayerThread extends EventEmitter {
  constructor(ws, username, gameServerName, gameServer) {
    super();
    console.log(`PlayerThread: constructor for - ${username}`);
    this.ws = ws;
    this.username = username;
    this.gameServerName = gameServerName;
    this.gameServer = gameServer;
    this.isWinner = false;
    this.percentComplete = 0;

    this.gameServer.addPlayer(this);

    this.send("username", this.username);
    this.send("gameServerName", this.gameServerName);
    this.send("prompt", this.gameServer.prompt);
    this.send("gameStart", this.gameServer.start);
    this.send("gameStop", this.gameServer.stop);
    this.send("winner", this.gameServer.winner);
    this.gameServer.sendPositionUpdate();

    this.ws.on("message", (message) => this.handleMessage(message));
  }

  handleMessage(message) {
    console.log(`PlayerThread: handleMessage: ${message}`);
    try {
      const parsedMessage = JSON.parse(message);
      const { type, value } = parsedMessage;

      switch (type) {
        case "percentComplete":
          this.percentComplete = parseFloat(value);
          this.gameServer.sendPositionUpdate();
          break;
        case "isWinner":
          console.log(`PlayerThread: ${this.username} is winner!`);
          this.isWinner = true;
          this.gameServer.stop = true;
          this.gameServer.winner = this;
          break;
        case "gameStats":
          this.updateGameStats(value);
          break;
        default:
          console.warn(`Unknown message type: ${type}`);
      }
    } catch (error) {
      console.error("Failed to handle message:", error);
    }
  }

  updateGameStats(value) {
    console.log("PlayerThread: updateGameStats");
    if (this.username === "guest") return;

    const gameStats = value; // Assuming value is already parsed JSON containing game stats.
    const playerStats = this.gameServer.jdbc.getPlayerStats(this.username);

    const updatedPlayerStats = {
      username: this.username,
      gamesPlayed: playerStats.gamesPlayed + 1,
      gamesWon: playerStats.gamesWon + (this.isWinner ? 1 : 0),
      totalCharactersTyped:
        playerStats.totalCharactersTyped + gameStats.numCharactersTyped,
      totalWordsTyped:
        playerStats.totalWordsTyped +
        Math.floor(gameStats.numCharactersTyped / 5),
      bestWPM: Math.max(playerStats.bestWPM, Math.floor(gameStats.CPM / 5.0)),
    };

    this.gameServer.jdbc.updatePlayerStats(updatedPlayerStats);
  }

  send(type, value) {
    const message = JSON.stringify({ type, value });
    this.ws.send(message, (err) => {
      if (err) {
        console.error(`Failed to send message: ${err}`);
      } else {
        console.log(`PlayerThread: send ${this.username} - ${message}`);
      }
    });
  }
}

module.exports = PlayerThread;
