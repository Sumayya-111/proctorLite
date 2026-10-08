import { useState } from "react";
import { submitAnswer, finishAttempt, logViolation } from "../api";
import useTabFocus from "../hooks/useTabFocus";

const MAX_VIOLATIONS = 1; // tab switches allowed before the quiz counts as failed

function TakeQuiz({ quizData }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [violationCount, setViolationCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(null);

  const questions = quizData.questions;
  const currentQuestion = questions[currentIndex];
  const hasFailed = violationCount >= MAX_VIOLATIONS;

  function handleViolation(type) {
    if (finished) return;
    setViolationCount((prev) => prev + 1);
    logViolation(quizData.attempt_id, type);
  }

  useTabFocus(handleViolation);

  async function handleAnswer(optionIndex) {
    await submitAnswer(quizData.attempt_id, {
      attempt_id: quizData.attempt_id,
      question_index: currentIndex,
      selected_option: optionIndex,
    });

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      const result = await finishAttempt(quizData.attempt_id);
      setScore(result);
      setFinished(true);
    }
  }

  if (finished) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white shadow-lg rounded-2xl p-8 text-center max-w-md w-full">
          {hasFailed ? (
            <>
              <div className="text-5xl mb-3">❌</div>
              <h2 className="text-2xl font-bold text-red-600 mb-2">You failed the quiz</h2>
              <p className="text-slate-600 mb-4">
                You switched tabs <b>{violationCount}</b> time{violationCount > 1 ? "s" : ""} during
                the exam, which breaks the rules.
              </p>
              <p className="text-sm bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4">
                Your teacher has been notified.
              </p>
              <p className="text-slate-400 text-sm">
                Score for reference: {score.score} / {score.total}
              </p>
            </>
          ) : (
            <>
              <div className="text-5xl mb-3">✅</div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">Quiz Finished</h2>
              <p className="text-4xl font-bold text-indigo-600 mb-2">
                {score.score} / {score.total}
              </p>
              <p className="text-slate-500">No rule violations detected</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-xl mx-auto bg-white shadow-lg rounded-2xl p-8">
        {hasFailed ? (
          <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
            <p className="font-semibold">
              ⚠️ Tab switches detected: {violationCount}. You have failed this quiz.
            </p>
            <p>Your teacher has been notified. You can still finish the quiz.</p>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-2 mb-6">
            Do not switch tabs or leave this page. Tab switches detected: {violationCount}
          </div>
        )}

        <p className="text-sm text-slate-400 mb-2">
          Question {currentIndex + 1} of {questions.length}
        </p>
        <h2 className="text-lg font-semibold text-slate-800 mb-6">
          {currentQuestion.question_text}
        </h2>
        <div className="space-y-3">
          {currentQuestion.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              className="w-full text-left border border-slate-300 rounded-lg px-4 py-3 hover:bg-indigo-50 hover:border-indigo-400 transition"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TakeQuiz;