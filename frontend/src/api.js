const BASE_URL = "http://127.0.0.1:8000";

export async function joinQuiz(data) {
  const res = await fetch(`${BASE_URL}/quizzes/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (res.status === 404) throw new Error("Invalid access code. Please check it and try again.");
  if (!res.ok) throw new Error("Something went wrong. Please try again.");
  return res.json();
}

export async function createQuiz(data) {
  const res = await fetch(`${BASE_URL}/quizzes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Could not create the quiz. Please try again.");
  return res.json();
}

export async function submitAnswer(attemptId, data) {
  const res = await fetch(`${BASE_URL}/attempts/${attemptId}/answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function finishAttempt(attemptId) {
  const res = await fetch(`${BASE_URL}/attempts/${attemptId}/finish`, {
    method: "POST",
  });
  return res.json();
}

export async function logViolation(attemptId, violationType) {
  const res = await fetch(`${BASE_URL}/attempts/${attemptId}/violation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ attempt_id: attemptId, violation_type: violationType }),
  });
  return res.json();
}