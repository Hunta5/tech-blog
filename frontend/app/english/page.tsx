'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { getDailyWords, generateQuiz, getProgress, saveProgress, checkIn, toggleSavedWord, markKnown, addQuizScore, type Progress, type QuizQuestion } from '@/lib/english/engine'
import { WORD_BANK, type Word } from '@/lib/english/words'

type Tab = 'daily' | 'quiz' | 'notebook'

export default function EnglishPage() {
    const { lang } = useLanguage()
    const isKo = lang === 'ko'
    const tLang = isKo ? 'ko' : 'zh'

    const [tab, setTab] = useState<Tab>('daily')
    const [progress, setProgress] = useState<Progress | null>(null)
    const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set())

    // Quiz state
    const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
    const [currentQ, setCurrentQ] = useState(0)
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
    const [quizScore, setQuizScore] = useState(0)
    const [quizDone, setQuizDone] = useState(false)

    const dailyWords = useMemo(() => getDailyWords(new Date(), 5), [])

    // Load progress
    useEffect(() => {
        const p = getProgress()
        setProgress(p)
    }, [])

    // Check in
    const handleCheckIn = useCallback(() => {
        if (!progress) return
        const updated = checkIn(progress)
        setProgress(updated)
        saveProgress(updated)
    }, [progress])

    // Auto check-in on first visit
    useEffect(() => {
        if (progress && progress.lastDate !== `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`) {
            handleCheckIn()
        }
    }, [progress, handleCheckIn])

    const handleSaveWord = (word: string) => {
        if (!progress) return
        const updated = toggleSavedWord(progress, word)
        setProgress(updated)
        saveProgress(updated)
    }

    const handleMarkKnown = (word: string) => {
        if (!progress) return
        const updated = markKnown(progress, word)
        setProgress(updated)
        saveProgress(updated)
    }

    const toggleFlip = (idx: number) => {
        setFlippedCards(prev => {
            const next = new Set(prev)
            next.has(idx) ? next.delete(idx) : next.add(idx)
            return next
        })
    }

    // Start quiz
    const startQuiz = () => {
        const questions = generateQuiz(dailyWords, tLang)
        setQuizQuestions(questions)
        setCurrentQ(0)
        setSelectedAnswer(null)
        setQuizScore(0)
        setQuizDone(false)
        setTab('quiz')
    }

    const handleAnswer = (idx: number) => {
        if (selectedAnswer !== null) return
        setSelectedAnswer(idx)
        if (idx === quizQuestions[currentQ].correctIndex) {
            setQuizScore(s => s + 1)
        }
    }

    const nextQuestion = () => {
        if (currentQ + 1 >= quizQuestions.length) {
            setQuizDone(true)
            if (progress) {
                const updated = addQuizScore(progress, quizScore + (selectedAnswer === quizQuestions[currentQ].correctIndex ? 1 : 0), quizQuestions.length)
                setProgress(updated)
                saveProgress(updated)
            }
        } else {
            setCurrentQ(q => q + 1)
            setSelectedAnswer(null)
        }
    }

    // Notebook words
    const savedWordsList = useMemo(() => {
        if (!progress) return []
        return WORD_BANK.filter(w => progress.savedWords.includes(w.word))
    }, [progress])

    const checkedInToday = progress?.lastDate === `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`

    const tabs: { key: Tab; label: string; icon: string }[] = [
        { key: 'daily', label: isKo ? '오늘의 단어' : '今日单词', icon: '📖' },
        { key: 'quiz', label: isKo ? '퀴즈' : '测验', icon: '🧠' },
        { key: 'notebook', label: isKo ? '단어장' : '单词本', icon: '📝' },
    ]

    return (
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-16">
            {/* Header */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-cyan-500 to-teal-500 bg-clip-text text-transparent">
                {isKo ? '매일 영어' : '每日英语'}
            </h1>
            <p className="text-gray-400 mb-6">
                {isKo ? '매일 5개 단어를 학습하고, 퀴즈로 테스트하세요.' : '每天学 5 个单词，用测验检验效果。'}
            </p>

            {/* Streak bar */}
            {progress && (
                <div className="flex items-center gap-4 mb-8 p-4 rounded-xl bg-gray-800/30 border border-gray-700/50">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🔥</span>
                        <div>
                            <div className="text-2xl font-bold text-orange-400">{progress.streak}</div>
                            <div className="text-[10px] text-gray-500">{isKo ? '연속 일' : '连续天'}</div>
                        </div>
                    </div>
                    <div className="w-px h-10 bg-gray-700" />
                    <div>
                        <div className="text-lg font-bold text-blue-400">{progress.totalDays}</div>
                        <div className="text-[10px] text-gray-500">{isKo ? '총 학습일' : '总学习天数'}</div>
                    </div>
                    <div className="w-px h-10 bg-gray-700" />
                    <div>
                        <div className="text-lg font-bold text-green-400">{progress.knownWords.length}</div>
                        <div className="text-[10px] text-gray-500">{isKo ? '학습 완료' : '已掌握'}</div>
                    </div>
                    <div className="w-px h-10 bg-gray-700" />
                    <div>
                        <div className="text-lg font-bold text-purple-400">{progress.savedWords.length}</div>
                        <div className="text-[10px] text-gray-500">{isKo ? '단어장' : '单词本'}</div>
                    </div>

                    {checkedInToday && (
                        <div className="ml-auto px-3 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs">
                            ✅ {isKo ? '오늘 출석 완료' : '今日已打卡'}
                        </div>
                    )}
                </div>
            )}

            {/* Tabs */}
            <div className="flex bg-gray-800/50 rounded-xl p-1 border border-gray-700 mb-8">
                {tabs.map(t => (
                    <button key={t.key} onClick={() => t.key === 'quiz' ? startQuiz() : setTab(t.key)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            tab === t.key
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                : 'text-gray-400 hover:text-white border border-transparent'
                        }`}>
                        <span>{t.icon}</span>
                        <span>{t.label}</span>
                    </button>
                ))}
            </div>

            {/* ==================== Daily Words ==================== */}
            {tab === 'daily' && (
                <div className="space-y-4">
                    {dailyWords.map((word, idx) => {
                        const flipped = flippedCards.has(idx)
                        const isKnown = progress?.knownWords.includes(word.word)
                        const isSaved = progress?.savedWords.includes(word.word)

                        return (
                            <div key={word.word}
                                className={`rounded-2xl border overflow-hidden transition-all ${isKnown ? 'bg-green-500/5 border-green-500/20' : 'bg-gray-800/30 border-gray-700/50'}`}>

                                {/* Card front - always visible */}
                                <div className="p-5 cursor-pointer" onClick={() => toggleFlip(idx)}>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="text-xl font-bold text-white">{word.word}</span>
                                                <span className="text-xs text-gray-500 font-mono">{word.phonetic}</span>
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-700/50 text-gray-400">{word.pos}</span>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                                    word.difficulty === 1 ? 'bg-green-500/10 text-green-400' :
                                                    word.difficulty === 2 ? 'bg-yellow-500/10 text-yellow-400' :
                                                    'bg-red-500/10 text-red-400'
                                                }`}>
                                                    {'★'.repeat(word.difficulty)}
                                                </span>
                                            </div>
                                            {!flipped && (
                                                <p className="text-sm text-gray-500 mt-2">
                                                    {isKo ? '카드를 클릭하면 뜻이 보입니다' : '点击卡片查看释义'}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button onClick={(e) => { e.stopPropagation(); handleSaveWord(word.word) }}
                                                className={`p-1.5 rounded-lg transition ${isSaved ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-400'}`}
                                                title={isKo ? '단어장에 저장' : '收藏到单词本'}>
                                                {isSaved ? '★' : '☆'}
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); handleMarkKnown(word.word) }}
                                                className={`p-1.5 rounded-lg text-xs transition ${isKnown ? 'text-green-400' : 'text-gray-600 hover:text-green-400'}`}
                                                title={isKo ? '학습 완료' : '已掌握'}>
                                                {isKnown ? '✅' : '○'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Card back - meanings */}
                                    {flipped && (
                                        <div className="mt-4 pt-4 border-t border-gray-700/50 space-y-3">
                                            <div className="flex gap-4">
                                                <div>
                                                    <span className="text-[10px] text-gray-600">中文</span>
                                                    <p className="text-sm text-cyan-400 font-medium">{word.zh}</p>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-gray-600">한국어</span>
                                                    <p className="text-sm text-purple-400 font-medium">{word.ko}</p>
                                                </div>
                                            </div>
                                            <div className="bg-gray-800/50 rounded-lg p-3">
                                                <p className="text-sm text-gray-300 italic">&ldquo;{word.example}&rdquo;</p>
                                                <p className="text-xs text-gray-500 mt-1">{isKo ? word.exampleKo : word.exampleZh}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}

                    {/* Quiz CTA */}
                    <div className="text-center pt-4">
                        <button onClick={startQuiz}
                            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium text-sm hover:opacity-90 transition shadow-lg shadow-blue-500/20">
                            🧠 {isKo ? '퀴즈로 테스트하기' : '开始测验'}
                        </button>
                    </div>
                </div>
            )}

            {/* ==================== Quiz ==================== */}
            {tab === 'quiz' && !quizDone && quizQuestions.length > 0 && (
                <div className="max-w-lg mx-auto">
                    {/* Progress */}
                    <div className="flex items-center justify-between mb-6">
                        <span className="text-sm text-gray-500">{currentQ + 1} / {quizQuestions.length}</span>
                        <span className="text-sm text-green-400">{isKo ? '정답' : '正确'}: {quizScore}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-700 mb-8">
                        <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${((currentQ + 1) / quizQuestions.length) * 100}%` }} />
                    </div>

                    {/* Question */}
                    <div className="text-center mb-8">
                        <p className="text-xs text-gray-500 mb-2">{isKo ? '다음 단어의 뜻은?' : '这个单词的意思是？'}</p>
                        <h2 className="text-4xl font-bold text-white mb-1">{quizQuestions[currentQ].word.word}</h2>
                        <p className="text-sm text-gray-500 font-mono">{quizQuestions[currentQ].word.phonetic}</p>
                    </div>

                    {/* Options */}
                    <div className="space-y-3 mb-8">
                        {quizQuestions[currentQ].options.map((opt, idx) => {
                            const isSelected = selectedAnswer === idx
                            const isCorrect = idx === quizQuestions[currentQ].correctIndex
                            const showResult = selectedAnswer !== null

                            let style = 'bg-gray-800/30 border-gray-700/50 text-gray-300 hover:bg-gray-800/50 hover:border-gray-600'
                            if (showResult && isCorrect) style = 'bg-green-500/10 border-green-500/30 text-green-400'
                            else if (showResult && isSelected && !isCorrect) style = 'bg-red-500/10 border-red-500/30 text-red-400'

                            return (
                                <button key={idx} onClick={() => handleAnswer(idx)}
                                    disabled={selectedAnswer !== null}
                                    className={`w-full text-left px-5 py-3.5 rounded-xl border transition-all ${style}`}>
                                    <span className="text-gray-500 mr-3">{String.fromCharCode(65 + idx)}.</span>
                                    {opt}
                                    {showResult && isCorrect && <span className="float-right">✅</span>}
                                    {showResult && isSelected && !isCorrect && <span className="float-right">❌</span>}
                                </button>
                            )
                        })}
                    </div>

                    {/* Example sentence after answer */}
                    {selectedAnswer !== null && (
                        <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4 mb-6">
                            <p className="text-sm text-gray-300 italic">&ldquo;{quizQuestions[currentQ].word.example}&rdquo;</p>
                            <p className="text-xs text-gray-500 mt-1">
                                {isKo ? quizQuestions[currentQ].word.exampleKo : quizQuestions[currentQ].word.exampleZh}
                            </p>
                        </div>
                    )}

                    {selectedAnswer !== null && (
                        <div className="text-center">
                            <button onClick={nextQuestion}
                                className="px-6 py-2.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition">
                                {currentQ + 1 >= quizQuestions.length ? (isKo ? '결과 보기' : '查看结果') : (isKo ? '다음 문제' : '下一题')} →
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Quiz done */}
            {tab === 'quiz' && quizDone && (
                <div className="max-w-lg mx-auto text-center py-8">
                    <div className="text-6xl mb-4">{quizScore >= 4 ? '🎉' : quizScore >= 3 ? '👍' : '💪'}</div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {quizScore} / {quizQuestions.length} {isKo ? '정답' : '正确'}
                    </h2>
                    <p className="text-gray-400 mb-6">
                        {quizScore === quizQuestions.length
                            ? (isKo ? '완벽합니다! 🎉' : '满分！🎉')
                            : quizScore >= 3
                            ? (isKo ? '잘했습니다!' : '不错！')
                            : (isKo ? '내일 다시 도전하세요!' : '明天继续加油！')}
                    </p>

                    {/* Score bar */}
                    <div className="h-3 rounded-full bg-gray-700 mb-8 max-w-xs mx-auto">
                        <div className={`h-full rounded-full transition-all ${
                            quizScore >= 4 ? 'bg-green-500' : quizScore >= 3 ? 'bg-yellow-500' : 'bg-orange-500'
                        }`} style={{ width: `${(quizScore / quizQuestions.length) * 100}%` }} />
                    </div>

                    <div className="flex justify-center gap-3">
                        <button onClick={startQuiz}
                            className="px-5 py-2.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition">
                            🔄 {isKo ? '다시 도전' : '再来一次'}
                        </button>
                        <button onClick={() => setTab('daily')}
                            className="px-5 py-2.5 bg-gray-800 border border-gray-700 text-gray-400 hover:text-white rounded-lg text-sm transition">
                            📖 {isKo ? '단어 복습' : '复习单词'}
                        </button>
                    </div>
                </div>
            )}

            {/* ==================== Notebook ==================== */}
            {tab === 'notebook' && (
                <div>
                    {savedWordsList.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="text-5xl mb-4">📝</div>
                            <p className="text-gray-500">{isKo ? '저장된 단어가 없습니다. ★를 클릭하여 단어를 저장하세요.' : '暂无收藏单词。点击 ★ 收藏单词。'}</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {savedWordsList.map(word => (
                                <div key={word.word} className="flex items-center gap-4 px-4 py-3 rounded-xl bg-gray-800/20 border border-gray-700/30">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-white">{word.word}</span>
                                            <span className="text-xs text-gray-500 font-mono">{word.phonetic}</span>
                                            <span className="text-[10px] text-gray-600">{word.pos}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {isKo ? word.ko : word.zh}
                                        </p>
                                    </div>
                                    <button onClick={() => handleSaveWord(word.word)}
                                        className="text-yellow-400 hover:text-yellow-300 transition text-sm">
                                        ★
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
