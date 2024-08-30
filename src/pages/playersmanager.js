// const playersByName = new Map();
// const playersByWebSocket = new Map();

// function addPlayer(playername, gamename) {
//   const playerData = { playername, gamename, websocket: null };
//   playersByName.set(playername, playerData);
// }

// function addWebSocketToPlayer(playername, websocket) {
//   const playerData = playersByName.get(playername);
//   if (playerData) {
//     // Update the player data with the WebSocket
//     playerData.websocket = websocket;

//     // Add to playersByWebSocket map
//     playersByWebSocket.set(websocket, playerData);
//   } else {
//     console.error(`Player with name ${playername} not found.`);
//   }
// }

// function getPlayerByName(playername) {
//   return playersByName.get(playername);
// }

// function getPlayerByWebSocket(websocket) {
//   return playersByWebSocket.get(websocket);
// }

// function removePlayer(playername) {
//   const playerData = playersByName.get(playername);
//   if (playerData) {
//     if (playerData.websocket) {
//       playersByWebSocket.delete(playerData.websocket);
//     }
//     playersByName.delete(playername);
//   }
// }

// module.exports = {
//   addPlayer,
//   addWebSocketToPlayer,
//   getPlayerByName,
//   getPlayerByWebSocket,
//   removePlayer,
// };
