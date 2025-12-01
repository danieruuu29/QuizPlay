// src/components/Leaderboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaders = async () => {
      const { data, error } = await supabase
        .from('players')
        .select('name, total_points, room_id')
        .order('total_points', { ascending: false })
        .limit(10);

      if (!error) {
        setLeaders(data || []);
      }
      setLoading(false);
    };

    fetchLeaders();
    const interval = setInterval(fetchLeaders, 5000); // auto-refresh tiap 5 detik
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center text-indigo-800 mb-6">🏆 Leaderboard</h1>
        
        {loading ? (
          <p className="text-center text-gray-600">Memuat...</p>
        ) : leaders.length === 0 ? (
          <p className="text-center text-gray-500">Belum ada pemain.</p>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            {leaders.map((player, idx) => (
              <div
                key={player.id}
                className={`flex justify-between items-center p-4 ${
                  idx === 0 ? 'bg-yellow-50 border-b' :
                  idx === 1 ? 'bg-gray-50 border-b' :
                  idx === 2 ? 'bg-amber-50 border-b' : 'border-b'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-lg font-bold ${
                    idx === 0 ? 'text-yellow-600' :
                    idx === 1 ? 'text-gray-600' :
                    idx === 2 ? 'text-amber-800' : 'text-gray-500'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="font-medium">{player.name}</span>
                </div>
                <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-bold">
                  {player.total_points} poin
                </span>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => navigate('/')}
          className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700"
        >
          ← Kembali ke Beranda
        </button>
      </div>
    </div>
  );
}