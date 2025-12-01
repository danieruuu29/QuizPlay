// src/components/PairPlayers.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import supabase from '../supabaseClient';

export default function PairPlayers() {
  const { roomId } = useParams();
  const [players, setPlayers] = useState([]);
  const [selectedPair, setSelectedPair] = useState({ player1: '', player2: '' });
  const [pairs, setPairs] = useState([]);
  const navigate = useNavigate();

  // Ambil daftar pemain yang sudah join
  useEffect(() => {
    const fetchPlayers = async () => {
      const { data } = await supabase
        .from('players')
        .select('*')
        .eq('room_id', roomId)
        .order('joined_at', { ascending: true });
      setPlayers(data || []);
    };

    const fetchPairs = async () => {
      const { data } = await supabase
        .from('pairs')
        .select('*')
        .eq('room_id', roomId);
      setPairs(data || []);
    };

    fetchPlayers();
    fetchPairs();
    const interval = setInterval(() => {
      fetchPlayers();
      fetchPairs();
    }, 3000); // refresh tiap 3 detik

    return () => clearInterval(interval);
  }, [roomId]);

  const handleCreatePair = async () => {
    const { player1, player2 } = selectedPair;
    if (!player1 || !player2 || player1 === player2) {
      alert('Pilih dua pemain yang berbeda!');
      return;
    }

    const { error } = await supabase
      .from('pairs')
      .insert({
        room_id: roomId,
        player1_id: player1,
        player2_id: player2,
        game_state: {
          player1_lives: 3,
          player2_lives: 3,
          player1_consecutive: 0,
          player2_consecutive: 0,
          status: 'waiting',
        },
      });

    if (error) {
      alert('Gagal membuat pasangan: ' + error.message);
    } else {
      // Reset form
      setSelectedPair({ player1: '', player2: '' });
      // Refresh
      const { data } = await supabase
        .from('pairs')
        .select('*')
        .eq('room_id', roomId);
      setPairs(data || []);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-indigo-700 mb-2">👥 Pasangkan Pemain</h1>
        <p className="text-gray-600 mb-4">Room ID: <span className="font-mono">{roomId}</span></p>

        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <h2 className="font-semibold mb-3">Buat Pasangan Baru</h2>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={selectedPair.player1}
              onChange={(e) => setSelectedPair({ ...selectedPair, player1: e.target.value })}
              className="p-2 border rounded"
            >
              <option value="">Pilih Pemain 1</option>
              {players.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <select
              value={selectedPair.player2}
              onChange={(e) => setSelectedPair({ ...selectedPair, player2: e.target.value })}
              className="p-2 border rounded"
            >
              <option value="">Pilih Pemain 2</option>
              {players.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleCreatePair}
            className="mt-3 bg-indigo-600 text-white px-4 py-2 rounded w-full"
          >
            Buat Pasangan
          </button>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-semibold mb-3">Pasangan yang Sudah Dibuat ({pairs.length})</h2>
          {pairs.length === 0 ? (
            <p className="text-gray-500">Belum ada pasangan.</p>
          ) : (
            <ul className="space-y-2">
              {pairs.map(pair => {
                const p1 = players.find(p => p.id === pair.player1_id);
                const p2 = players.find(p => p.id === pair.player2_id);
                return (
                  <li key={pair.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                    <span>{p1?.name} vs {p2?.name}</span>
                    <button
                      onClick={() => navigate(`/game/${pair.id}`)}
                      className="text-indigo-600 hover:underline text-sm"
                    >
                      Main ➡️
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <button
          onClick={() => navigate(`/manage-questions/${roomId}`)}
          className="mt-6 text-indigo-600 hover:underline"
        >
          ← Kelola Soal
        </button>
      </div>
    </div>
  );
}