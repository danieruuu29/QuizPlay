// src/App.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-indigo-700 mb-6">🎮 QuizPlay</h1>
        
        <div className="space-y-4">
  <Link
    to="/create-room"
    className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition"
  >
    👩‍🏫 Buat Room (Guru)
  </Link>

  <Link
    to="/join-room"
    className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition"
  >
    👨‍🎓 Masuk Room (Siswa)
  </Link>

  <Link
    to="/leaderboard"
    className="block w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-4 rounded-lg transition"
  >
    🏆 Lihat Leaderboard
  </Link>
</div>

        <p className="mt-6 text-sm text-gray-500"></p>
      </div>
    </div>
  );
}

export default App;