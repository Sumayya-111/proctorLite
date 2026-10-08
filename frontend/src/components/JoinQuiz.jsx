import { useState } from "react";
import { joinQuiz } from "../api";

function JoinQuiz({ onJoined }) {
  const [accessCode, setAccessCode] = useState("");
  const [studentName, setStudentName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleJoin() {
    setError("");

    if (!studentName.trim()) return setError("Please enter your name.");
    if (!accessCode.trim()) return setError("Please enter the access code.");

    setLoading(true);
    try {
      const result = await joinQuiz({
        access_code: accessCode.trim().toUpperCase(),
        student_name: studentName.trim(),
      });
      onJoined(result);
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot reach the server. Please try again later."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
  <div className="flex-1 flex items-center justify-center px-4 py-10">
    <div className="bg-white shadow-xl shadow-indigo-100/60 border border-slate-100 rounded-2xl p-8 max-w-md w-full">
      <h1 className="text-2xl font-bold text-slate-800">Join a Quiz</h1>
      <p className="text-slate-500 text-sm mt-1 mb-6">
        Enter the access code your teacher shared with you.
      </p>

      <label className="block text-sm font-medium text-slate-600 mb-1">Your name</label>
      <input
        className="w-full border border-slate-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        placeholder="e.g. Ayesha Khan"
        value={studentName}
        onChange={(e) => setStudentName(e.target.value)}
      />

      <label className="block text-sm font-medium text-slate-600 mb-1">Access code</label>
      <input
        className="w-full border border-slate-300 rounded-lg px-4 py-2 mb-4 uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-400"
        placeholder="X7K2B"
        value={accessCode}
        onChange={(e) => setAccessCode(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleJoin()}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2 mb-4">
          {error}
        </div>
      )}

      <button
        onClick={handleJoin}
        disabled={loading}
        className="w-full bg-indigo-600 text-white font-medium rounded-lg py-2.5 hover:bg-indigo-700 transition disabled:opacity-50"
      >
        {loading ? "Joining..." : "Join Quiz"}
      </button>

      <p className="text-xs text-slate-400 text-center mt-4">
        🔒 Tab switching is monitored during the quiz.
      </p>
    </div>
  </div>
);
}

export default JoinQuiz;