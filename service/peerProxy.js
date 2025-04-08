const { WebSocketServer } = require('ws');

function peerProxy(httpServer) {
  const socketServer = new WebSocketServer({ server: httpServer });
  const waitingPlayers = [];

  socketServer.on('connection', (socket) => {
    console.log('Client connected');
    socket.isAlive = true;
    socket.userName = null;
    socket.opponent = null;
    socket.round = 1;
    socket.totalScore = 0;
    socket.choice = null;
    
    socket.on('message', (data) => {
      let message;
      try {
        message = JSON.parse(data);
        console.log('Received message:', message);
      } catch (e) {
        console.error('Failed to parse message or invalid JSON:', data);
        return;
      }      
      if (message.type === 'join') { 
        socket.userName = message.userName;
        waitingPlayers.push(socket);
        matchPlayers();
      } else if (message.type === 'choice') {
        if (socket.opponent && socket.userName) {
          socket.choice = message.choice;
          handleChoices(socket);
        } else {
          console.warn(`Choice received from unidentified or unmatched player: ${socket.userName}`);
        }
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
    console.log('Attempting to match players...');
    while (waitingPlayers.length >= 2) {
      const player1 = waitingPlayers[0];
      const player2 = waitingPlayers[1];

      if (player1.userName && player2.userName) {
        waitingPlayers.splice(0, 2);
        console.log(`Matching ${player1.userName} and ${player2.userName}`);

        // Set opponents
        player1.opponent = player2;
        player2.opponent = player1;

        // Initialize game state
        player1.round = 1; 
        player2.round = 1;
        player1.totalScore = 0;
        player2.totalScore = 0;
        player1.choice = null; 
        player2.choice = null;

        // Notify both players - Usernames are guaranteed to be set here
        try {
          player1.send(JSON.stringify({ type: 'start', opponentName: player2.userName }));
          player2.send(JSON.stringify({ type: 'start', opponentName: player1.userName }));
          console.log(`Sent 'start' to ${player1.userName} and ${player2.userName}`);
        } catch (error) {
              console.error('Error sending start message:', error);
        }
      } else {
        console.log('Waiting for players to identify before matching.');
        break; 
      }
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
              // await saveScoreToDatabase(player, opponent);
              console.log(`Sending game_over to ${player.userName} and ${opponent.userName}`);
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

  // async function saveScoreToDatabase(player1, player2) {
  //   const date = new Date().toLocaleString();
  //   const [user1Name, user2Name] = [player1.userName, player2.userName].sort();
  
  //   const user1Score = user1Name === player1.userName ? player1.totalScore : player2.totalScore;
  //   const user2Score = user2Name === player2.userName ? player2.totalScore : player1.totalScore;
  
  //   const newScore = {
  //     user1Name,
  //     user1Score,
  //     user2Name,
  //     user2Score,
  //     date,
  //   };
  
  //   console.log("Submitting final score to DB:", newScore);
  
  //   try {
  //     await fetch('/api/score', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(newScore),
  //     });
  //   } catch (err) {
  //     console.error("Failed to submit score to DB:", err);
  //   }
  // }
  
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


