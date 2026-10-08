import { useState } from "react";
import CreateQuiz from "./components/CreateQuiz";
import JoinQuiz from "./components/JoinQuiz";
import TakeQuiz from "./components/TakeQuiz";

const TABS = [
  { id: "join", label: "Student" },
  { id: "create", label: "Teacher" },
];

function App() {
  const [view, setView] = useState("join");
  const [quizData, setQuizData] = useState(null);

  if (quizData) {
    return <TakeQuiz quizData={quizData} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-slate-100">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-lg">
              🛡️
            </div>
            <span className="text-lg font-bold text-slate-800">ProctorLite</span>
          </div>

          <div className="flex bg-slate-100 rounded-lg p-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                  view === tab.id
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 flex">
        {view === "join" ? <JoinQuiz onJoined={setQuizData} /> : <CreateQuiz />}
      </main>
    </div>
  );
}

export default App;