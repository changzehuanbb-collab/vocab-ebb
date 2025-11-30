import { useEffect, useState } from "react";
import {
  getTodayReviewWords,
  updateProgressAfterReview,
} from "./reviewStorage";
import QuizCard from "./QuizCard";
import { WORDS } from "./words";
import "./App.css";

// 提供给 QuizCard 用来抽错误选项
window.WORD_POOL = WORDS;

// 发音函数（整个 App 公用）
function speakWord(text) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    alert("当前浏览器不支持语音朗读功能");
    return;
  }
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US"; // 英文发音
  utter.rate = 0.9; // 稍微慢一点
  window.speechSynthesis.cancel(); // 停掉上一次
  window.speechSynthesis.speak(utter);
}

function App() {
  const [todayWords, setTodayWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [mode, setMode] = useState("review"); // "review" 或 "quiz"
  const [showMeaning, setShowMeaning] = useState(false); // 是否显示中文释义

  useEffect(() => {
    const list = getTodayReviewWords();
    setTodayWords(list);
    setFinished(list.length === 0);
    setCurrentIndex(0);
    setShowMeaning(false);
  }, []);

  const handleAnswer = (isCorrect) => {
    const current = todayWords[currentIndex];
    if (!current) return;

    // 更新艾宾浩斯进度
    updateProgressAfterReview(current.word.id, !isCorrect ? false : true);

    const next = currentIndex + 1;
    if (next >= todayWords.length) {
      setFinished(true);
      setShowMeaning(false);
    } else {
      setCurrentIndex(next);
      setShowMeaning(false); // 换单词时重置「显示中文」
    }
  };

  const handleShowMeaning = () => {
    setShowMeaning(true);
  };

  // 计算进度（用已完成的数量 / 总数）
  const totalCount = todayWords.length;
  const completedCount = currentIndex; // 当前单词之前的都算“完成”
  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // ---------------- 选择题模式 ----------------
  if (mode === "quiz") {
    if (finished) {
      return (
        <div className="app-container">
          <div className="mode-switch">
            <button
              className={mode === "review" ? "btn-mode active" : "btn-mode"}
              onClick={() => setMode("review")}
            >
              复习模式
            </button>
            <button
              className={mode === "quiz" ? "btn-mode active" : "btn-mode"}
              onClick={() => setMode("quiz")}
            >
              选择题模式
            </button>
          </div>
          <h2>🎉 今日测试完成！</h2>
          {totalCount > 0 && (
            <p style={{ marginTop: 8, color: "#6b7280", fontSize: 14 }}>
              今日任务完成度：100%
            </p>
          )}
        </div>
      );
    }

    if (todayWords.length === 0) {
      return <h2>今天没有需要复习的单词</h2>;
    }

    const current = todayWords[currentIndex];

    return (
      <div className="app-container">
        <div className="mode-switch">
          <button
            className={mode === "review" ? "btn-mode active" : "btn-mode"}
            onClick={() => setMode("review")}
          >
            复习模式
          </button>
          <button
            className={mode === "quiz" ? "btn-mode active" : "btn-mode"}
            onClick={() => setMode("quiz")}
          >
            选择题模式
          </button>
        </div>

        <h1>选择题模式</h1>
        <p>
          当前进度：{currentIndex + 1} / {todayWords.length}
        </p>

        {/* 进度条 */}
        {totalCount > 0 && (
          <div className="progress-container">
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="progress-text">
              今日任务完成度：{progressPercent}%
            </div>
          </div>
        )}

        <QuizCard word={current.word} onAnswer={handleAnswer} />
      </div>
    );
  }

  // ---------------- 复习模式 ----------------
  if (finished) {
    return (
      <div className="app-container">
        <div className="mode-switch">
          <button
            className={mode === "review" ? "btn-mode active" : "btn-mode"}
            onClick={() => setMode("review")}
          >
            复习模式
          </button>
          <button
            className={mode === "quiz" ? "btn-mode active" : "btn-mode"}
            onClick={() => setMode("quiz")}
          >
            选择题模式
          </button>
        </div>
        <h2>🎉 今日复习完成！</h2>
        {totalCount > 0 && (
          <p style={{ marginTop: 8, color: "#6b7280", fontSize: 14 }}>
            今日任务完成度：100%
          </p>
        )}
      </div>
    );
  }

  if (todayWords.length === 0) {
    return <h2>今天没有需要复习的单词</h2>;
  }

  const current = todayWords[currentIndex];

  return (
    <div className="app-container">
      <div className="mode-switch">
        <button
          className={mode === "review" ? "btn-mode active" : "btn-mode"}
          onClick={() => setMode("review")}
        >
          复习模式
        </button>
        <button
          className={mode === "quiz" ? "btn-mode active" : "btn-mode"}
          onClick={() => setMode("quiz")}
        >
          选择题模式
        </button>
      </div>

      <h1>艾宾浩斯单词复习</h1>

      <p>
        当前进度：{currentIndex + 1} / {todayWords.length}
      </p>

      {/* 进度条 */}
      {totalCount > 0 && (
        <div className="progress-container">
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="progress-text">
            今日任务完成度：{progressPercent}%
          </div>
        </div>
      )}

      <div className="card">
        {/* 头部：单词 + 发音按钮 */}
        <div className="word-main">
          <span className="word-text">{current.word.word}</span>
          {current.word.phonetic && (
            <span className="phonetic">{current.word.phonetic}</span>
          )}
          <button
            className="btn-speak"
            onClick={() => speakWord(current.word.word)}
          >
            🔊 读一遍
          </button>
        </div>

        {current.word.pos && <p className="pos">{current.word.pos}</p>}

        {/* 默认不显示中文，先让学生在脑子里想 */}
        {!showMeaning && (
          <button className="btn secondary" onClick={handleShowMeaning}>
            显示中文意思
          </button>
        )}

        {/* 显示中文释义后，再让学生判断记得/忘了 */}
        {showMeaning && (
          <>
            <p className="meaning">{current.word.meaningZh}</p>
            <div className="buttons">
              <button
                className="btn btn-forgot"
                onClick={() => handleAnswer(false)}
              >
                我忘了
              </button>
              <button
                className="btn btn-remember"
                onClick={() => handleAnswer(true)}
              >
                我记得
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
