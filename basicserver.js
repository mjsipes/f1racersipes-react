const http = require("http");

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Hello World");
});

server.listen(2000);
// server.listen(2000, () => {
//   console.log("Server is running on port 2000");
// });
