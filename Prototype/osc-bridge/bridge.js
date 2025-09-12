// osc-bridge/bridge.js
const osc = require("osc");
const WebSocket = require("ws");

// --- UDP (classic OSC) side ---
const udp = new osc.UDPPort({
  localAddress: "0.0.0.0",
  localPort: 57121,          // free local UDP port for replies
  remoteAddress: "127.0.0.1",// your OSC app (Max/SC/TD/etc.)
  remotePort: 57120,         // change to your app's OSC-in port
  metadata: true
});

udp.on("ready", () => {
  console.log("UDP listening on", udp.options.localAddress + ":" + udp.options.localPort);
  console.log("UDP forwarding to", udp.options.remoteAddress + ":" + udp.options.remotePort);
});
udp.on("message", (msg) => {
  console.log("UDP →", msg.address, msg.args);
});
udp.open();

// --- WebSocket (browser) side ---
const wss = new WebSocket.Server({ port: 8081 });
console.log("WebSocket listening on ws://localhost:8081");

wss.on("connection", (socket) => {
  console.log("Browser connected");

  // Wrap this socket with an osc.WebSocketPort
  const wsPort = new osc.WebSocketPort({ socket, metadata: true });

  // Browser → UDP
  wsPort.on("message", (msg) => {
    console.log("WS → UDP", msg.address, msg.args);
    udp.send(msg);
  });

  // UDP → Browser
  const onUdp = (msg) => wsPort.send(msg);
  udp.on("message", onUdp);

  socket.on("close", () => {
    udp.removeListener("message", onUdp);
    console.log("Browser disconnected");
  });
});
