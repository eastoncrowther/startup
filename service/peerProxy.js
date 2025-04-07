const { WebSocketServer } = require('ws');

function peerProxy(httpServer) {
  const socketServer = new WebSocketServer({ server: httpServer });
  const waitingPlayers = [];

  socketServer.on('connection', (socket) => {
    socket.isAlive = true;
    socket.round = 1;
    socket.totalScore = 0;
    socket.choice = null;

    waitingPlayers.push(socket);
    matchPlayers();

    socket.on('message', (data) => {
      const message = JSON.parse(data);
      if (message.type === 'choice') {
        socket.choice = message.choice;
        handleChoices(socket);
      }
    });

    socket.on('pong', () => {
      socket.isAlive = true;
    });

    socket.on('close', () => {
      const index = waitingPlayers.indexOf(socket);
      if (index !== -1) {
        waitingPlayers.splice(index, 1);
      }
      handleDisconnection(socket);
    });
  });

  function matchPlayers() {
    while (waitingPlayers.length >= 2) {
      const player1 = waitingPlayers.shift();
      const player2 = waitingPlayers.shift();

      // Set opponents
      player1.opponent = player2;
      player2.opponent = player1;

      // Initialize round/score
      player1.round = player2.round = 1;
      player1.totalScore = player2.totalScore = 0;

      // Notify both players
      player1.send(JSON.stringify({ type: 'start' }));
      player2.send(JSON.stringify({ type: 'start' }));
    }
  }

  function handleChoices(player) {
    const opponent = player.opponent;
    if (!opponent || opponent.readyState !== WebSocket.OPEN) return;

    if (player.choice && opponent.choice) {
      const result = determineOutcome(player.choice, opponent.choice);

      // Update scores
      player.totalScore += result.player1Score;
      opponent.totalScore += result.player2Score;

      // Send results to both players
      player.send(JSON.stringify({
        type: 'result',
        yourScore: result.player1Score,
        opponentScore: result.player2Score,
      }));

      opponent.send(JSON.stringify({
        type: 'result',
        yourScore: result.player2Score,
        opponentScore: result.player1Score,
      }));

      // Advance round
      player.round++;
      opponent.round++;

      // Reset choices
      player.choice = null;
      opponent.choice = null;

      // End game if round > 5 (frontend will handle final score)
      if (player.round > 5 || opponent.round > 5) {
        // Optional: you can send a game over message
        // player.send(JSON.stringify({ type: 'game_over' }));
        // opponent.send(JSON.stringify({ type: 'game_over' }));
        player.opponent = null;
        opponent.opponent = null;
      }
    }
  }

  function determineOutcome(choice1, choice2) {
    if (choice1 === 'confess' && choice2 === 'confess') {
      return { player1Score: 5, player2Score: 5 };
    } else if (choice1 === 'confess' && choice2 === 'quiet') {
      return { player1Score: 0, player2Score: 8 };
    } else if (choice1 === 'quiet' && choice2 === 'confess') {
      return { player1Score: 8, player2Score: 0 };
    } else {
      return { player1Score: 1, player2Score: 1 };
    }
  }

  function handleDisconnection(player) {
    const opponent = player.opponent;
    if (opponent && opponent.readyState === WebSocket.OPEN) {
      opponent.send(JSON.stringify({ type: 'opponent_left' }));
      opponent.opponent = null;
    }
  }

  setInterval(() => {
    socketServer.clients.forEach((client) => {
      if (!client.isAlive) {
        client.terminate();
      } else {
        client.isAlive = false;
        client.ping();
      }
    });
  }, 10000);
}

module.exports = { peerProxy };


