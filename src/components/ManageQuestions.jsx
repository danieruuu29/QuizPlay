// src/components/ManageQuestions.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import supabase from '../supabaseClient';

export default function ManageQuestions() {
  const { roomId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Form untuk tambah soal
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    answer: 0,
  });

  // Form untuk edit soal
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    question: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    answer: 0,
  });

  // Ambil soal dari Supabase
  useEffect(() => {
    const fetchQuestions = async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching questions:', error);
        alert('Gagal memuat soal');
      } else {
        setQuestions(data || []);
      }
      setLoading(false);
    };

    if (roomId) fetchQuestions();
  }, [roomId]);

  // Tambah soal
  const handleAddQuestion = async (e) => {
    e.preventDefault();

    const options = [
      newQuestion.option1.trim(),
      newQuestion.option2.trim(),
      newQuestion.option3.trim(),
      newQuestion.option4.trim(),
    ];

    if (options.some(opt => opt === '')) {
      alert('Semua pilihan jawaban wajib diisi!');
      return;
    }

    const { error } = await supabase
      .from('questions')
      .insert({
        room_id: roomId,
        category: 'umum',
        question: newQuestion.question.trim(),
        options: options,
        answer: newQuestion.answer,
      });

    if (error) {
      alert('Gagal menambah soal: ' + error.message);
    } else {
      setNewQuestion({
        question: '',
        option1: '',
        option2: '',
        option3: '',
        option4: '',
        answer: 0,
      });
      // Refresh daftar
      const { data } = await supabase
        .from('questions')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });
      setQuestions(data || []);
    }
  };

  // Mulai edit
  const startEditing = (question) => {
    setEditingId(question.id);
    setEditForm({
      question: question.question || '',
      option1: (question.options && question.options[0]) || '',
      option2: (question.options && question.options[1]) || '',
      option3: (question.options && question.options[2]) || '',
      option4: (question.options && question.options[3]) || '',
      answer: question.answer || 0,
    });
  };

  // Simpan edit
  const handleUpdateQuestion = async (e) => {
    e.preventDefault();

    const options = [
      editForm.option1.trim(),
      editForm.option2.trim(),
      editForm.option3.trim(),
      editForm.option4.trim(),
    ];

    if (options.some(opt => opt === '')) {
      alert('Semua pilihan jawaban wajib diisi!');
      return;
    }

    const { error } = await supabase
      .from('questions')
      .update({
        question: editForm.question.trim(),
        options: options,
        answer: editForm.answer,
      })
      .eq('id', editingId);

    if (error) {
      alert('Gagal memperbarui soal: ' + error.message);
    } else {
      const { data } = await supabase
        .from('questions')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });
      setQuestions(data || []);
      setEditingId(null);
    }
  };

  // Hapus soal
  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Yakin ingin menghapus soal ini?')) return;

    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Gagal menghapus soal: ' + error.message);
    } else {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-indigo-700 mb-2">📚 Kelola Soal</h1>
        <p className="text-gray-600 mb-6">
          Room ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{roomId}</span>
        </p>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Tambah Soal Baru</h2>
          <form onSubmit={handleAddQuestion} className="space-y-3">
            <input
              type="text"
              placeholder="Pertanyaan..."
              value={newQuestion.question}
              onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
            {['option1', 'option2', 'option3', 'option4'].map((opt, idx) => (
              <input
                key={opt}
                type="text"
                placeholder={`Pilihan ${String.fromCharCode(65 + idx)}...`}
                value={newQuestion[opt]}
                onChange={(e) => setNewQuestion({ ...newQuestion, [opt]: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            ))}
            <div>
              <label className="block text-sm font-medium mb-1">Jawaban Benar:</label>
              <select
                value={newQuestion.answer}
                onChange={(e) => setNewQuestion({ ...newQuestion, answer: Number(e.target.value) })}
                className="p-2 border rounded w-full"
              >
                <option value={0}>A</option>
                <option value={1}>B</option>
                <option value={2}>C</option>
                <option value={3}>D</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 w-full"
            >
              Tambah Soal
            </button>
          </form>

          <h2 className="text-lg font-semibold mt-8 mb-4">Daftar Soal ({questions.length})</h2>
          {loading ? (
            <p className="text-gray-500">Memuat soal...</p>
          ) : questions.length === 0 ? (
            <p className="text-gray-500">Belum ada soal. Tambahkan sekarang!</p>
          ) : (
            <div className="space-y-4">
              {questions.map((q) => (
                <div key={q.id} className="border border-gray-200 p-4 rounded">
                  {editingId === q.id ? (
                    <form onSubmit={handleUpdateQuestion} className="space-y-3">
                      <input
                        type="text"
                        value={editForm.question}
                        onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                      />
                      {['option1', 'option2', 'option3', 'option4'].map((opt, idx) => (
                        <input
                          key={opt}
                          type="text"
                          value={editForm[opt]}
                          onChange={(e) => setEditForm({ ...editForm, [opt]: e.target.value })}
                          className="w-full p-2 border rounded"
                          required
                        />
                      ))}
                      <select
                        value={editForm.answer}
                        onChange={(e) => setEditForm({ ...editForm, answer: Number(e.target.value) })}
                        className="p-2 border rounded w-full"
                      >
                        <option value={0}>A</option>
                        <option value={1}>B</option>
                        <option value={2}>C</option>
                        <option value={3}>D</option>
                      </select>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Simpan
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="bg-gray-500 text-white px-3 py-1 rounded text-sm"
                        >
                          Batal
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <p className="font-medium">{q.question}</p>
                      <p className="text-sm text-gray-600">
                        Jawaban: {q.options && q.options[q.answer] ? q.options[q.answer] : '—'}
                      </p>
                      <div className="mt-2 flex gap-3">
                        <button
                          onClick={() => startEditing(q)}
                          className="text-blue-600 hover:underline text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="text-red-600 hover:underline text-sm font-medium"
                        >
                          Hapus
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
  <button
    onClick={() => navigate(-1)}
    className="text-indigo-600 hover:underline"
  >
    ← Kembali
  </button>
  <button
    onClick={() => navigate(`/pair-players/${roomId}`)}
    className="bg-amber-600 text-white px-4 py-2 rounded"
  >
    👥 Pasangkan Pemain
  </button>
</div>
      </div>
    </div>
  );
}