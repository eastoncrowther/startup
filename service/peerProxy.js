const { WebSocketServer } = require('ws');
const fetch = require('node-fetch');

function peerProxy(httpServer) {
  const socketServer = new WebSocketServer({ server: httpServer });
  const waitingPlayers = [];

  socketServer.on('connection', (socket) => {
    socket.isAlive = true;
    socket.round = 1;
    socket.totalScore = 0;
    socket.choice = null;
    socket.inGame = false;

    socket.on('message', (data) => {
      const message = JSON.parse(data);
      if (message.type === 'join') {
        socket.userName = message.userName;

        if (!socket.inGame) {
          waitingPlayers.push(socket);
          matchPlayers();
          socket.inGame = false;
        }
      } else if (message.type === 'choice') {
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

      if (!player1 || !player2 || !player1.userName || !player2.userName) {
        if(player1) waitingPlayers.unshift(player1); // Put back if valid
        if(player2) waitingPlayers.unshift(player2); // Put back if valid
        console.error("Attempted to match players without usernames set.");
        continue;
      }

      // Prevent rematch if already in a game
      if (player1.opponent || player2.opponent) {
        waitingPlayers.unshift(player1);
        waitingPlayers.unshift(player2);
        console.warn("Attempted rematch avoided.");
        continue;
      }

      // Set opponents
      player1.opponent = player2;
      player2.opponent = player1;
      player1.inGame = true;
      player2.inGame = true;

      // Initialize round/score
      player1.round = player2.round = 1;
      player1.totalScore = player2.totalScore = 0;

      // Notify both players
      player1.send(JSON.stringify({ type: 'start', opponentName: player2.userName }));
      player2.send(JSON.stringify({ type: 'start', opponentName: player1.userName }));
    }
  }

  async function handleChoices(player) {
    const opponent = player.opponent;
    if (!opponent || opponent.readyState !== WebSocket.OPEN || player.round > 5) return;
  
    
    if (player.choice && opponent.choice) {
      const currentRound = player.round;
      if (currentRound > 5) {
        console.warn(`Attempted to process choice for round ${currentRound}`);
        return;
      }

      const result = determineOutcome(player.choice, opponent.choice);
  
      player.totalScore += result.player1Score;
      opponent.totalScore += result.player2Score;
  
      // Send round result
      player.send(JSON.stringify({
        type: 'result',
        yourScore: result.player1Score,
        opponentScore: result.player2Score,
        round: currentRound
      }));
  
      opponent.send(JSON.stringify({
        type: 'result',
        yourScore: result.player2Score,
        opponentScore: result.player1Score,
        round: currentRound
      }));
  
      player.choice = null;
      opponent.choice = null;
  
      // Check if this was the final round (Round 5)
      if (currentRound === 5) {
        // Use setTimeout to allow result messages to potentially reach clients first
        setTimeout(async () => {
          // Ensure players haven't disconnected during the short delay
          if (player.readyState === WebSocket.OPEN && opponent.readyState === WebSocket.OPEN) {
              await saveScoreToDatabase(player, opponent);

              player.send(JSON.stringify({
                  type: 'game_over',
                  yourTotal: player.totalScore,
                  opponentTotal: opponent.totalScore,
              }));
              opponent.send(JSON.stringify({
                  type: 'game_over',
                  yourTotal: opponent.totalScore,
                  opponentTotal: player.totalScore,
              }));
          }

          // Clean up opponent references after game over
          player.opponent = null;
          opponent.opponent = null;
          player.inGame = false; // Reset flag
          opponent.inGame = false; // Reset flag
        }, 100); // 100ms delay
      } else {
        // If not the final round, advance the round counter
        player.round++;
        opponent.round++;
      }
    }
  }

  async function saveScoreToDatabase(player1, player2) {
    const date = new Date().toLocaleString();
    const [user1Name, user2Name] = [player1.userName, player2.userName].sort();
  
    const user1Score = user1Name === player1.userName ? player1.totalScore : player2.totalScore;
    const user2Score = user2Name === player2.userName ? player2.totalScore : player1.totalScore;
  
    const newScore = {
      user1Name,
      user1Score,
      user2Name,
      user2Score,
      date,
    };
  
    console.log("Submitting final score to DB:", newScore);
  
    try {
      await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newScore),
      });
    } catch (err) {
      console.error("Failed to submit score to DB:", err);
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


