// src/components/CreateRoom.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';
import { v4 as uuidv4 } from 'uuid'; // kita butuh ini untuk ID acak

// Tambahkan library uuid untuk generate ID unik
// Kita install sebentar lagi!

export default function CreateRoom() {
  const [hostName, setHostName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!hostName.trim()) return;

    setLoading(true);
    const id = uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();

    const { error } = await supabase
      .from('rooms')
      .insert({ id, host_name: hostName });

    if (error) {
      alert('Gagal membuat room: ' + error.message);
    } else {
      setRoomId(id);
      // Opsional: arahkan ke halaman sukses atau simpan ID
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-indigo-700 mb-4">👩‍🏫 Buat Room Baru</h2>
        
        {roomId ? (
          <div className="text-center">
            <p className="text-green-600 font-semibold mb-2">✅ Room berhasil dibuat!</p>
            <p className="text-lg font-mono bg-gray-100 p-2 rounded mb-4">{roomId}</p>
            <p className="text-sm text-gray-600 mb-4">
              Bagikan Room ID ini ke siswa!
            </p>
            <button
              onClick={() => navigate('/join-room')}
              className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700"
            >
              Masuk Room
            </button>
          </div>
        ) : (
          <form onSubmit={handleCreateRoom}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Nama Guru</label>
              <input
                type="text"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Contoh: Bu Siti"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Membuat...' : 'Buat Room'}
            </button>
          </form>
        )}
        
        {roomId && (
  <div className="mt-4 space-y-3">
    <p className="text-green-600 font-semibold">✅ Room berhasil dibuat!</p>
    <p className="font-mono bg-gray-100 p-2 rounded">{roomId}</p>
    <button
      onClick={() => navigate(`/manage-questions/${roomId}`)}
      className="mt-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded"
    >
      📝 Kelola Soal
    </button>
  </div>
)}
        <button
          onClick={() => navigate('/')}
          className="mt-4 text-indigo-600 hover:underline"
        >
          ← Kembali ke Beranda
        </button>
      </div>
    </div>
  );
}