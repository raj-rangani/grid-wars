"use client";

import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001"); // Adjust port if needed

function GameBoard({
  roomId,
  player,
  setNotification,
}: {
  roomId: string;
  player: string;
  setNotification: (notification: string) => void;
}) {
  const [board, setBoard] = useState(Array(9).fill(""));
  const [turn, setTurn] = useState("X");
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [scores, setScores] = useState<{ X: number; O: number }>({
    X: 0,
    O: 0,
  });

  useEffect(() => {
    socket.emit("getGameState", { room: roomId });
    socket.on(
      "gameUpdate",
      (data: {
        board: string[];
        turn: string;
        gameOver: boolean;
        winner: string | null;
        scores?: { X: number; O: number };
      }) => {
        console.log(data);
        setBoard(data.board);
        setTurn(data.turn);
        setGameOver(data.gameOver);
        setWinner(data.winner ?? null);
        setNotification("");
        if (data.scores) setScores(data.scores);
      }
    );

    socket.on(
      "gameOver",
      (data: { winner: string; scores?: { X: number; O: number } }) => {
        setGameOver(true);
        setWinner(data.winner ?? null);
        if (data.scores) setScores(data.scores);
        setNotification(
          data.winner
            ? data.winner === player
              ? "You win!"
              : "You lose!"
            : "It's a draw!"
        );
      }
    );

    socket.on("playerDisconnected", () => {
      setNotification("Opponent disconnected. Game ended.");
      setGameOver(true);
    });

    return () => {
      socket.off("gameUpdate");
      socket.off("gameOver");
      socket.off("playerDisconnected");
    };
  }, [roomId, player, setNotification]);

  const handleCellClick = (idx: number) => {
    console.log(gameOver, board[idx], turn !== player);
    if (gameOver || board[idx] || turn !== player) return;
    socket.emit("makeMove", { room: roomId, idx, player });
  };

  const handleRestart = () => {
    socket.emit("restartGame", { room: roomId });
    setNotification("");
  };

  return (
    <div className="game-board">
      <div className="info">
        <div className="room-title">Room: {roomId}</div>
        {/* Scores section as cards */}
        <div className="score-cards">
          <div className={`score-card score-x${player === "X" ? " you" : ""}`}>
            <div className="score-label">
              {player === "X" ? <span className="you-badge">YOU</span> : "X"}
            </div>
            <div className="score-value">{scores.X}</div>
          </div>
          <div className={`score-card score-o${player === "O" ? " you" : ""}`}>
            <div className="score-label">
              {player === "O" ? <span className="you-badge">YOU</span> : "O"}
            </div>
            <div className="score-value">{scores.O}</div>
          </div>
        </div>
        <div>
          {gameOver
            ? winner
              ? `Winner: ${winner}`
              : "Draw!"
            : turn === player
              ? "Your turn"
              : "Opponent's turn"}
        </div>
      </div>
      <div className="board-grid">
        {board.map((cell, idx) => (
          <button
            key={idx}
            className="cell"
            onClick={() => handleCellClick(idx)}
            disabled={!!cell || gameOver || turn !== player}
          >
            {cell}
          </button>
        ))}
      </div>
      <button
        className="restart-btn"
        onClick={handleRestart}
        disabled={!gameOver}
      >
        Restart
      </button>
    </div>
  );
}

export default GameBoard;
