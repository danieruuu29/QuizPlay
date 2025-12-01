// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import CreateRoom from './components/CreateRoom';
import JoinRoom from './components/JoinRoom';
import './index.css';
import ManageQuestions from './components/ManageQuestions';
import PairPlayers from './components/PairPlayers';
import GameRoom from './components/GameRoom';
import Leaderboard from './components/Leaderboard';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/create-room",
    element: <CreateRoom />,
  },
  {
    path: "/join-room",
    element: <JoinRoom />,
  },
  {
  path: "/manage-questions/:roomId",
  element: <ManageQuestions />,
  },
  {
  path: "/pair-players/:roomId",
  element: <PairPlayers />,
  },
  {
  path: "/game/:pairId",
  element: <GameRoom />,
  },
  {
  path: "/leaderboard",
  element: <Leaderboard />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);