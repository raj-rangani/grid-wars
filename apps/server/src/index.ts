import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Adjust to your frontend port
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.get("/", (req, res) => res.send("Tic-Tac-Toe Server Running!"));

// In-memory game rooms
const rooms = {};

function getInitialBoard() {
  return Array(9).fill("");
}

function checkWinner(board) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // cols
    [0, 4, 8],
    [2, 4, 6], // diags
  ];
  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return board.every((cell) => cell) ? "draw" : null;
}

io.on("connection", (socket) => {
  console.log(socket.rooms);
  socket.on("joinRoom", ({ room }, callback) => {
    if (!rooms[room]) {
      rooms[room] = {
        players: [socket.id],
        board: getInitialBoard(),
        turn: "X",
        gameOver: false,
        winner: null,
        scores: { X: 0, O: 0 }, // Add scores
      };
      io.sockets.socketsJoin(room);
      callback({ player: "X" });
    } else if (rooms[room].players.length === 1) {
      rooms[room].players.push(socket.id);
      io.sockets.socketsJoin(room);
      callback({ player: "O" });
      // Notify both players to start
      io.to(room).emit("gameUpdate", {
        board: rooms[room].board,
        turn: rooms[room].turn,
        gameOver: rooms[room].gameOver,
        winner: rooms[room].winner,
        scores: rooms[room].scores, // Send scores
      });
    } else {
      callback({ error: "Room is full!" });
    }

    console.log(socket.rooms);
  });

  socket.on("getGameState", ({ room }) => {
    console.log("GAME STATE", socket.rooms);
    if (rooms[room]) {
      socket.emit("gameUpdate", {
        board: rooms[room].board,
        turn: rooms[room].turn,
        gameOver: rooms[room].gameOver,
        winner: rooms[room].winner,
        scores: rooms[room].scores, // Send scores
      });
    }
  });

  socket.on("makeMove", ({ room, idx, player }) => {
    const game = rooms[room];
    console.log(game);
    if (!game || game.gameOver) return;
    if (game.board[idx] || game.turn !== player) return;
    game.board[idx] = player;
    const winner = checkWinner(game.board);
    if (winner) {
      game.gameOver = true;
      game.winner = winner === "draw" ? null : winner;
      if (winner === "X" || winner === "O") {
        game.scores[winner] += 1; // Increment score
      }
      io.to(room).emit("gameUpdate", {
        board: game.board,
        turn: game.turn,
        gameOver: game.gameOver,
        winner: game.winner,
        scores: game.scores, // Send scores
      });
      io.to(room).emit("gameOver", {
        winner: game.winner,
        scores: game.scores,
      });
    } else {
      game.turn = game.turn === "X" ? "O" : "X";
      io.to(room).emit("gameUpdate", {
        board: game.board,
        turn: game.turn,
        gameOver: false,
        winner: null,
        scores: game.scores, // Send scores
      });
    }
  });

  socket.on("restartGame", ({ room }) => {
    if (rooms[room]) {
      rooms[room].board = getInitialBoard();
      rooms[room].turn = "X";
      rooms[room].gameOver = false;
      rooms[room].winner = null;
      // Do NOT reset scores here
      io.to(room).emit("gameUpdate", {
        board: rooms[room].board,
        turn: rooms[room].turn,
        gameOver: false,
        winner: null,
        scores: rooms[room].scores, // Send scores
      });
    }
  });

  socket.on("disconnect", () => {
    console.log(socket.rooms, "SD");
    for (const room in rooms) {
      const index = rooms[room].players.indexOf(socket.id);
      if (index !== -1) {
        rooms[room].players.splice(index, 1);
        if (rooms[room].players.length === 0) {
          delete rooms[room]; // Clean memory
        }
      }

      io.sockets.socketsLeave(room);
    }
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
