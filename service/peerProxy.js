const { WebSocketServer } = require('ws');


function peerProxy(httpServer) {
  // Create a websocket object
  const socketServer = new WebSocketServer({ server: httpServer });

  const playersWaiting = [];
  const games = new Map();

  socketServer.on('connection', (socket) => {
    socket.isAlive = true;

    // Match players in pairs
    if (playersWaiting.length > 0) {
      const opponent = playersWaiting.pop();
      const gameId = uuid.v4();

      games.set(gameId, { players: [socket, opponent], choices: {} });

      socket.gameId = gameId;
      opponent.gameId = gameId;

      socket.send(JSON.stringify({ type: 'start', message: 'Game started!', player: 1 }));
      opponent.send(JSON.stringify({ type: 'start', message: 'Game started!', player: 2 }));
    } else {
      playersWaiting.push(socket);
    }

    socket.on('message', (data) => {
      const message = JSON.parse(data);
      const game = games.get(socket.gameId);
      if (!game) return;
  
      if (message.type === 'choice') {
        game.choices[socket] = message.choice;
  
        const [player1, player2] = game.players;
        if (game.choices[player1] && game.choices[player2]) {
          const choice1 = game.choices[player1];
          const choice2 = game.choices[player2];
  
          // Compute scores based on the Prisoner's Dilemma
          let score1 = 0, score2 = 0;
          if (choice1 === "confess" && choice2 === "confess") {
            score1 = score2 = 5;
          } else if (choice1 === "confess" && choice2 === "quiet") {
            score2 = 8;
          } else if (choice1 === "quiet" && choice2 === "confess") {
            score1 = 8;
          } else {
            score1 = score2 = 1;
          }
  
          // Send results to both players
          player1.send(JSON.stringify({ type: 'result', yourChoice: choice1, opponentChoice: choice2, yourScore: score1, opponentScore: score2 }));
          player2.send(JSON.stringify({ type: 'result', yourChoice: choice2, opponentChoice: choice1, yourScore: score2, opponentScore: score1 }));
  
          game.choices = {}; // Reset choices for next round
        }
      }
    });


    socket.on('close', () => {
      const index = playersWaiting.indexOf(socket);
      if (index !== -1) playersWaiting.splice(index, 1);
  
      const game = games.get(socket.gameId);
      if (game) {
        const opponent = game.players.find(p => p !== socket);
        if (opponent) {
          opponent.send(JSON.stringify({ type: 'opponent_left' }));
        }
        games.delete(socket.gameId);
      }
    });

    // Respond to pong messages by marking the connection alive
    socket.on('pong', () => {
      socket.isAlive = true;
    });
  });

  // Periodically send out a ping message to make sure clients are alive
  setInterval(() => {
    socketServer.clients.forEach(function each(client) {
      if (client.isAlive === false) return client.terminate();

      client.isAlive = false;
      client.ping();
    });
  }, 10000);
}

module.exports = { peerProxy };
