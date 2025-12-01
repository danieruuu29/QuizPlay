// src/components/GameRoom.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';

export default function GameRoom() {
  const { pairId } = useParams();
  const navigate = useNavigate();

  const [pair, setPair] = useState(null);
  const [players, setPlayers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [gameStatus, setGameStatus] = useState('waiting'); // 'waiting', 'question', 'result', 'finished'
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Ambil data pair & pemain
  useEffect(() => {
    const fetchData = async () => {
      // Ambil pair
      const { data: pairData, error: pairError } = await supabase
        .from('pairs')
        .select('*')
        .eq('id', pairId)
        .single();

      if (pairError || !pairData) {
        alert('Pasangan tidak ditemukan!');
        navigate('/');
        return;
      }

      // Ambil pemain
      const { data: playerData } = await supabase
        .from('players')
        .select('*')
        .in('id', [pairData.player1_id, pairData.player2_id]);

      const playerMap = {};
      playerData.forEach(p => {
        playerMap[p.id] = p;
      });

      setPair(pairData);
      setPlayers(playerMap);
      setLoading(false);
    };

    fetchData();
  }, [pairId, navigate]);

  // Realtime listen perubahan pair
  useEffect(() => {
    if (!pairId) return;

    const channel = supabase
      .channel(`pair-${pairId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'pairs', filter: `id=eq.${pairId}` },
        (payload) => {
          const updatedPair = payload.new;
          setPair(updatedPair);

          // Cek apakah game selesai
          const gameState = updatedPair.game_state || {};
          if (gameState.winner) {
            setGameStatus('finished');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pairId]);

  // Mulai ronde baru
  const startNewRound = async () => {
    if (!pair) return;

    setGameStatus('question');
    setSubmitted(false);
    setSelectedOption(null);
    setResultMessage('');

    // Ambil soal acak dari room
    const { data: questions, error } = await supabase
      .from('questions')
      .select('*')
      .eq('room_id', pair.room_id);

    if (error || questions.length === 0) {
      alert('Belum ada soal di room ini!');
      return;
    }

    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    setCurrentQuestion(randomQuestion);
  };

  // Kirim jawaban
  const handleSubmit = async () => {
    if (selectedOption === null || !pair || submitted) return;

    setSubmitted(true);

    const isCorrect = selectedOption === currentQuestion.answer;
    const answeredAt = new Date().toISOString();

    // Simpan jawaban sementara di localStorage (untuk demo)
    // Di versi production, kamu bisa kirim ke tabel `answers`
    localStorage.setItem(`answer_${pairId}`, JSON.stringify({
      selectedOption,
      isCorrect,
      answeredAt,
      playerId: Object.keys(players).find(id => players[id].name === 'Your Name') // Ini hanya contoh
    }));

    // Untuk demo, kita langsung proses di sini
    // Di sistem real, kamu perlu kirim ke backend & bandingkan dua jawaban

    // ⚠️ CATATAN PENTING:
    // Logika "siapa lebih cepat" seharusnya di-handle oleh server (Supabase Function)
    // Tapi untuk mempermudah, kita asumsikan pemain ini menang jika benar

    if (isCorrect) {
      setResultMessage('✅ Benar! Menunggu lawan...');
    } else {
      setResultMessage('❌ Salah!');
    }

    // Simulasi: setelah 3 detik, lanjut ke hasil
    setTimeout(() => {
      processRoundResult(isCorrect);
    }, 3000);
  };

  // Proses hasil ronde (sederhana)
  const processRoundResult = async (isCorrect) => {
    if (!pair) return;

    const gameState = pair.game_state || {};
    const isPlayer1 = Object.keys(players)[0] === localStorage.getItem('myPlayerId'); // Ini hanya simulasi

    let newGameState = { ...gameState };

    if (isCorrect) {
      // Naikkan consecutive
      const key = isPlayer1 ? 'player1_consecutive' : 'player2_consecutive';
      newGameState[key] = (newGameState[key] || 0) + 1;

      // Healing jika 2x benar
      if (newGameState[key] >= 2) {
        const lifeKey = isPlayer1 ? 'player1_lives' : 'player2_lives';
        newGameState[lifeKey] = Math.min(3, (newGameState[lifeKey] || 3) + 1);
        newGameState[key] = 0; // reset
      }

      // Kurangi nyawa lawan
      const enemyKey = isPlayer1 ? 'player2_lives' : 'player1_lives';
      newGameState[enemyKey] = Math.max(0, (newGameState[enemyKey] || 3) - 1);

      // Tambah poin
      const playerId = isPlayer1 ? pair.player1_id : pair.player2_id;
      await supabase
        .from('players')
        .update({ total_points: (players[playerId]?.total_points || 0) + 10 })
        .eq('id', playerId);

      // Cek pemenang
      if (newGameState[enemyKey] <= 0) {
        newGameState.winner = playerId;
        newGameState.status = 'finished';
        setGameStatus('finished');
      }
    } else {
      // Reset consecutive
      const key = isPlayer1 ? 'player1_consecutive' : 'player2_consecutive';
      newGameState[key] = 0;
    }

    // Update game state
    await supabase
      .from('pairs')
      .update({ game_state: newGameState })
      .eq('id', pairId);

    setGameStatus('result');
    setResultMessage(isCorrect ? '🎯 Kamu menembak lawan!' : '💥 Lawan mungkin menembakmu...');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg">Memuat game...</p>
      </div>
    );
  }

  const player1 = players[pair?.player1_id];
  const player2 = players[pair?.player2_id];
  const gameState = pair?.game_state || {};

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-red-500 mb-2">🪫 Russian Roulette</h1>
          <div className="flex justify-between items-center bg-gray-800 p-3 rounded">
            <div className="text-center">
              <p className="font-semibold">{player1?.name || 'Pemain 1'}</p>
              <div className="flex gap-1 mt-1">
                {[...Array(3)].map((_, i) => (
                  <span key={i} className={`text-xl ${i < (gameState.player1_lives || 3) ? 'text-red-500' : 'text-gray-600'}`}>
                    ❤️
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-400">Poin: {player1?.total_points || 0}</p>
            </div>
            <div className="text-center">
              <p className="font-semibold">{player2?.name || 'Pemain 2'}</p>
              <div className="flex gap-1 mt-1">
                {[...Array(3)].map((_, i) => (
                  <span key={i} className={`text-xl ${i < (gameState.player2_lives || 3) ? 'text-red-500' : 'text-gray-600'}`}>
                    ❤️
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-400">Poin: {player2?.total_points || 0}</p>
            </div>
          </div>
        </div>

        {/* Game Area */}
        {gameStatus === 'waiting' && (
          <div className="bg-gray-800 rounded-xl p-6 text-center">
            <p className="mb-4">Menunggu ronde dimulai...</p>
            <button
              onClick={startNewRound}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-bold"
            >
              Mulai Ronde
            </button>
          </div>
        )}

        {gameStatus === 'question' && currentQuestion && (
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-lg mb-4">{currentQuestion.question}</h2>
            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedOption(idx)}
                  disabled={submitted}
                  className={`w-full text-left p-3 rounded ${
                    selectedOption === idx
                      ? 'bg-red-600'
                      : 'bg-gray-700 hover:bg-gray-600'
                  } ${submitted ? 'opacity-75' : ''}`}
                >
                  {String.fromCharCode(65 + idx)}. {option}
                </button>
              ))}
            </div>
            <button
              onClick={handleSubmit}
              disabled={selectedOption === null || submitted}
              className="mt-4 w-full bg-yellow-600 hover:bg-yellow-700 py-2 rounded font-bold disabled:opacity-50"
            >
              {submitted ? 'Menunggu...' : 'Kirim Jawaban'}
            </button>
          </div>
        )}

        {(gameStatus === 'result' || gameStatus === 'finished') && (
          <div className="bg-gray-800 rounded-xl p-6 text-center">
            <p className="text-xl mb-4">{resultMessage}</p>
            {gameState.winner ? (
              <div>
                <p className="text-green-400 text-xl font-bold mb-4">
                  🏆 {players[gameState.winner]?.name || 'Pemenang'} Menang!
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded"
                >
                  Kembali ke Beranda
                </button>
              </div>
            ) : (
              <button
                onClick={startNewRound}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
              >
                Ronde Berikutnya
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}