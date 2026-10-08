import { useState } from "react";
import { createQuiz } from "../api";

function CreateQuiz() {
  const [title, setTitle] = useState("");
  const [teacherEmail, setTeacherEmail] = useState("");
  const [questions, setQuestions] = useState([
    { question_text: "", options: ["", "", "", ""], correct_answer: 0 },
  ]);
  const [accessCode, setAccessCode] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateQuestionText(index, text) {
    const updated = [...questions];
    updated[index].question_text = text;
    setQuestions(updated);
  }

  function updateOption(qIndex, oIndex, text) {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = text;
    setQuestions(updated);
  }

  function updateCorrectAnswer(qIndex, value) {
    const updated = [...questions];
    updated[qIndex].correct_answer = Number(value);
    setQuestions(updated);
  }

  function addQuestion() {
    setQuestions([
      ...questions,
      { question_text: "", options: ["", "", "", ""], correct_answer: 0 },
    ]);
  }

  async function handleSubmit() {
    setError("");

    if (!title.trim()) return setError("Please enter a quiz title.");
    if (!/^\S+@\S+\.\S+$/.test(teacherEmail.trim()))
      return setError("Please enter a valid email address.");

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question_text.trim()) return setError(`Question ${i + 1} is empty.`);
      if (q.options.some((o) => !o.trim()))
        return setError(`Question ${i + 1} has an empty option.`);
    }

    setLoading(true);
    try {
      const result = await createQuiz({
        title: title.trim(),
        teacher_email: teacherEmail.trim(),
        questions,
      });
      setAccessCode(result.access_code);
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

  if (accessCode) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="bg-white shadow-lg rounded-2xl p-8 text-center max-w-md w-full">
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Quiz Created 🎉</h2>
          <p className="text-slate-500 mb-4">Share this code with your students:</p>
          <div className="text-3xl font-bold tracking-widest text-indigo-600 bg-indigo-50 py-3 rounded-lg">
            {accessCode}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Create a Quiz</h1>

        <div className="space-y-4 mb-8">
          <input
            className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Quiz title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Your email (for violation alerts)"
            value={teacherEmail}
            onChange={(e) => setTeacherEmail(e.target.value)}
          />
        </div>

        {questions.map((q, qIndex) => (
          <div key={qIndex} className="border border-slate-200 rounded-xl p-5 mb-4">
            <p className="text-sm font-medium text-slate-500 mb-2">Question {qIndex + 1}</p>
            <input
              className="w-full border border-slate-300 rounded-lg px-4 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Type your question"
              value={q.question_text}
              onChange={(e) => updateQuestionText(qIndex, e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3 mb-3">
              {q.options.map((opt, oIndex) => (
                <input
                  key={oIndex}
                  className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder={`Option ${oIndex + 1}`}
                  value={opt}
                  onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                />
              ))}
            </div>
            <select
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
              value={q.correct_answer}
              onChange={(e) => updateCorrectAnswer(qIndex, e.target.value)}
            >
              {q.options.map((_, oIndex) => (
                <option key={oIndex} value={oIndex}>
                  Correct: Option {oIndex + 1}
                </option>
              ))}
            </select>
          </div>
        ))}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2 mb-4">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={addQuestion}
            className="flex-1 border border-indigo-300 text-indigo-600 font-medium rounded-lg py-2 hover:bg-indigo-50 transition"
          >
            + Add Question
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-indigo-600 text-white font-medium rounded-lg py-2 hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Quiz"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateQuiz;