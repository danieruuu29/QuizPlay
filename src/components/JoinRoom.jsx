// src/components/JoinRoom.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';

export default function JoinRoom() {
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!roomId.trim() || !playerName.trim()) return;

    setLoading(true);

    // Cek apakah room exists
    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .select('id')
      .eq('id', roomId)
      .single();

    if (roomError || !roomData) {
      alert('Room tidak ditemukan! Pastikan Room ID benar.');
      setLoading(false);
      return;
    }

    // Tambahkan pemain ke room
    const { error: playerError } = await supabase
      .from('players')
      .insert({ room_id: roomId, name: playerName });

    if (playerError) {
      alert('Gagal masuk room: ' + playerError.message);
    } else {
      alert(`Berhasil masuk room!\nNama: ${playerName}\nRoom: ${roomId}`);
      // Nanti kita arahkan ke halaman game
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-indigo-700 mb-4">👨‍🎓 Masuk Room</h2>
        
        <form onSubmit={handleJoinRoom}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Room ID</label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              className="w-full p-2 border border-gray-300 rounded font-mono"
              placeholder="Contoh: a1b2c3d4"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Nama Siswa</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Contoh: Ani"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? 'Masuk...' : 'Masuk Room'}
          </button>
        </form>

        <button
          onClick={() => navigate('/')}
          className="mt-4 text-indigo-600 hover:underline block mx-auto"
        >
          ← Kembali ke Beranda
        </button>
      </div>
    </div>
  );
}