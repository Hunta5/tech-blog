import { WORD_BANK, type Word } from './words'

// ---- Deterministic daily selection ----

function hashDate(dateStr: string): number {
    let hash = 5381
    for (let i = 0; i < dateStr.length; i++) {
        hash = ((hash << 5) + hash + dateStr.charCodeAt(i)) | 0
    }
    return Math.abs(hash)
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
    const result = [...arr]
    let s = seed
    for (let i = result.length - 1; i > 0; i--) {
        s = (s * 1103515245 + 12345) & 0x7fffffff
        const j = s % (i + 1)
        ;[result[i], result[j]] = [result[j], result[i]]
    }
    return result
}

export function getDailyWords(date: Date, count: number = 5): Word[] {
    const dateStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    const seed = hashDate(dateStr)
    const shuffled = seededShuffle(WORD_BANK, seed)
    return shuffled.slice(0, count)
}

// ---- Quiz question generation ----

export interface QuizQuestion {
    word: Word
    options: string[]    // 4 choices (in user's language)
    correctIndex: number
}

export function generateQuiz(words: Word[], lang: 'zh' | 'ko'): QuizQuestion[] {
    return words.map(word => {
        const correct = lang === 'zh' ? word.zh : word.ko

        // pick 3 random wrong answers
        const others = WORD_BANK
            .filter(w => w.word !== word.word)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map(w => lang === 'zh' ? w.zh : w.ko)

        const options = [correct, ...others].sort(() => Math.random() - 0.5)
        const correctIndex = options.indexOf(correct)

        return { word, options, correctIndex }
    })
}

// ---- Streak / Progress (localStorage) ----

const STORAGE_KEY = 'english_progress'

export interface Progress {
    streak: number
    lastDate: string
    totalDays: number
    knownWords: string[]    // words marked as "known"
    savedWords: string[]    // words saved to notebook
    quizScores: { date: string; score: number; total: number }[]
}

export function getProgress(): Progress {
    if (typeof window === 'undefined') return defaultProgress()
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultProgress()
    try {
        return JSON.parse(raw)
    } catch {
        return defaultProgress()
    }
}

export function saveProgress(progress: Progress) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

function defaultProgress(): Progress {
    return { streak: 0, lastDate: '', totalDays: 0, knownWords: [], savedWords: [], quizScores: [] }
}

export function checkIn(progress: Progress): Progress {
    const today = todayStr()
    if (progress.lastDate === today) return progress // already checked in

    const yesterday = getDateStr(new Date(Date.now() - 86400000))
    const newStreak = progress.lastDate === yesterday ? progress.streak + 1 : 1

    return {
        ...progress,
        streak: newStreak,
        lastDate: today,
        totalDays: progress.totalDays + 1,
    }
}

export function toggleSavedWord(progress: Progress, word: string): Progress {
    const saved = progress.savedWords.includes(word)
        ? progress.savedWords.filter(w => w !== word)
        : [...progress.savedWords, word]
    return { ...progress, savedWords: saved }
}

export function markKnown(progress: Progress, word: string): Progress {
    if (progress.knownWords.includes(word)) return progress
    return { ...progress, knownWords: [...progress.knownWords, word] }
}

export function addQuizScore(progress: Progress, score: number, total: number): Progress {
    const today = todayStr()
    return {
        ...progress,
        quizScores: [...progress.quizScores.slice(-29), { date: today, score, total }],
    }
}

function todayStr() { return getDateStr(new Date()) }
function getDateStr(d: Date) { return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}` }
