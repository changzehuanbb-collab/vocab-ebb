import { WORDS } from "./words";

const STORAGE_KEY = "ebb_vocab_progress";
const INTERVALS = [0, 1, 2, 4, 7, 15, 30];

export function getTodayStr() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function addDays(dateStr, days) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

function loadProgress() {
  const json = localStorage.getItem(STORAGE_KEY);
  if (!json) return {};
  try {
    return JSON.parse(json);
  } catch {
    return {};
  }
}

function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function initProgressIfEmpty() {
  const progress = loadProgress();
  if (Object.keys(progress).length !== WORDS.length) {
    const today = getTodayStr();
    const newProgress = {};
    WORDS.forEach((w) => {
      newProgress[w.id] = {
        id: w.id,
        stageIndex: 0,
        nextReviewDate: today,
      };
    });
    saveProgress(newProgress);
    return newProgress;
  }
  return progress;
}

export function getTodayReviewWords() {
  const today = getTodayStr();
  const progress = initProgressIfEmpty();

  return WORDS.filter((w) => {
    const p = progress[w.id];
    return p?.nextReviewDate <= today;
  }).map((w) => ({
    word: w,
    progress: progress[w.id],
  }));
}

export function updateProgressAfterReview(wordId, isCorrect) {
  const progress = loadProgress();
  const today = getTodayStr();

  let p = progress[wordId];
  if (!p) {
    p = { id: wordId, stageIndex: 0, nextReviewDate: today };
  }

  let stage = p.stageIndex;
  if (isCorrect) {
    stage = Math.min(stage + 1, INTERVALS.length - 1);
  } else {
    stage = Math.max(stage - 1, 0);
  }

  const nextReviewDate = addDays(today, INTERVALS[stage]);

  progress[wordId] = { id: wordId, stageIndex: stage, nextReviewDate };
  saveProgress(progress);
}
