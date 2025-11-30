import { useEffect, useState } from "react";

/**
 * props:
 *   word: 当前要考察的单词对象（包含 word / meaningZh / pos 等）
 *   onAnswer: (isCorrect: boolean) => void
 */
function QuizCard({ word, onAnswer }) {
  const [options, setOptions] = useState([]); // [{ text, isCorrect }]
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [correctIndex, setCorrectIndex] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [locked, setLocked] = useState(false); // 防止连续点击

  // 获取全局词库
  function getWordPool() {
    const pool = window.WORD_POOL || [];
    return pool;
  }

  // 随机打乱
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // 发音函数
  function speakWord(text) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("当前浏览器不支持语音朗读功能");
      return;
    }
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US"; // 英文发音
    utter.rate = 0.9; // 语速稍微慢一点
    window.speechSynthesis.cancel(); // 先停掉上一次的
    window.speechSynthesis.speak(utter);
  }

  useEffect(() => {
    const pool = getWordPool();
    const others = pool.filter((w) => w.id !== word.id);

    // 生成“正确选项”
    const correctOption = {
      text: word.meaningZh,
      isCorrect: true,
    };

    // 随机抽取 3 个错误选项（如果不够就少一点）
    const shuffledOthers = shuffle(others);
    const wrongOptions = shuffledOthers.slice(0, 3).map((w) => ({
      text: w.meaningZh,
      isCorrect: false,
    }));

    const allOptions = shuffle([correctOption, ...wrongOptions]);

    setOptions(allOptions);
    setSelectedIndex(null);
    setLocked(false);
    setFeedback("");

    // 找到正确选项的下标
    const idx = allOptions.findIndex((o) => o.isCorrect);
    setCorrectIndex(idx);
  }, [word]);

  const handleSelect = (index) => {
    if (locked) return; // 已经点过一次就不再响应
    if (!options[index]) return;

    const opt = options[index];
    const isCorrect = opt.isCorrect;

    setSelectedIndex(index);
    setLocked(true);

    if (isCorrect) {
      setFeedback("✅ 回答正确！");
    } else {
      const correctOpt = options[correctIndex];
      setFeedback(
        `❌ 回答错误。正确答案是：${correctOpt.text}。本题已按“我忘了”计入复习计划。`
      );
    }

    // 正确题稍快，错误题给多一点时间看解析
    const delay = isCorrect ? 800 : 1500;

    setTimeout(() => {
      onAnswer(isCorrect);
    }, delay);
  };

  return (
    <div
      style={{
        padding: 20,
        border: "1px solid #ddd",
        borderRadius: 12,
        maxWidth: 600,
      }}
    >
      {/* 头部：单词 + 发音按钮 */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <h2 style={{ marginBottom: 4 }}>{word.word}</h2>
          {word.pos && <p style={{ color: "#666", margin: 0 }}>{word.pos}</p>}
        </div>
        <button
          onClick={() => speakWord(word.word)}
          style={{
            padding: "6px 10px",
            borderRadius: 999,
            border: "1px solid #ccc",
            background: "#f5f5f5",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          🔊 读一遍
        </button>
      </div>

      {/* 选项列表 */}
      {options.map((opt, idx) => {
        const isSelected = selectedIndex === idx;
        const isCorrect = opt.isCorrect;

        let bg = "white";
        if (selectedIndex !== null) {
          // 已经点过答案了，显示颜色
          if (idx === correctIndex) {
            // 正确答案
            bg = "#d1f7d6"; // 绿色
          }
          if (isSelected && !isCorrect) {
            // 选错的这个
            bg = "#ffdada"; // 红色
          }
        }

        return (
          <button
            key={idx}
            onClick={() => handleSelect(idx)}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              marginTop: 10,
              padding: 10,
              background: bg,
              border: "1px solid #ccc",
              borderRadius: 6,
              cursor: locked ? "default" : "pointer",
            }}
          >
            {idx + 1}. {opt.text}
          </button>
        );
      })}

      {feedback && (
        <div
          style={{
            marginTop: 12,
            padding: 10,
            background: "#f7f7ff",
            borderRadius: 8,
            fontSize: 14,
          }}
        >
          {feedback}
        </div>
      )}
    </div>
  );
}

export default QuizCard;
