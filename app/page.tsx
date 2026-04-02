'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Star, CheckCircle2, Clock, Sparkles, ChevronRight, RotateCcw } from 'lucide-react'

// ==============================
// 型定義
// ==============================
type TaskState = 'waiting' | 'active' | 'pinch' | 'done'
type CharState = 'waiting' | 'running' | 'panic' | 'clear'

interface Task {
  id: number
  name: string
  durationMin: number
  emoji: string
  color: string
  bgColor: string
  borderColor: string
  description: string
}

// ==============================
// タスクデータ
// ==============================
const TASKS: Task[] = [
  {
    id: 0,
    name: 'おきがえ',
    durationMin: 5,
    emoji: '👗',
    color: '#FF6FB1',
    bgColor: 'from-pink-100 to-pink-200',
    borderColor: 'border-pink-300',
    description: 'かわいいふくにきがえよう！',
  },
  {
    id: 1,
    name: 'かおをあらう',
    durationMin: 2,
    emoji: '🫧',
    color: '#60C5F7',
    bgColor: 'from-sky-100 to-sky-200',
    borderColor: 'border-sky-300',
    description: 'さっぱりきれいになろう！',
  },
  {
    id: 2,
    name: 'ごはん',
    durationMin: 15,
    emoji: '🍙',
    color: '#F5A623',
    bgColor: 'from-yellow-100 to-orange-100',
    borderColor: 'border-orange-300',
    description: 'もりもりたべてげんきをだそう！',
  },
  {
    id: 3,
    name: 'はみがき',
    durationMin: 3,
    emoji: '🦷',
    color: '#6EE7B7',
    bgColor: 'from-emerald-100 to-teal-100',
    borderColor: 'border-emerald-300',
    description: 'ぴかぴかのはにしよう！',
  },
  {
    id: 4,
    name: 'じゅんび',
    durationMin: 2,
    emoji: '🎒',
    color: '#C8A0FF',
    bgColor: 'from-purple-100 to-violet-100',
    borderColor: 'border-purple-300',
    description: 'わすれものはないかな？',
  },
]

// ==============================
// 応援メッセージ
// ==============================
const CHEER_MESSAGES = [
  '✨ すごいね！つぎもがんばろう！',
  '🌟 きみはさいきょう！ファイト！',
  '💖 かわいい！どんどんいくよ！',
  '🦄 まほうつかいみたい！すてき！',
  '🌈 ひかりかがやいてるよ！',
  '🎀 おうじょさまみたいにかっこいい！',
  '⭐ きみのえがおがいちばんかわいい！',
  '🌸 どんどんうまくなってるね！',
  '💫 まかせて！ぜったいできるよ！',
  '🍭 あと少し！一緒にがんばろう！',
]

// ==============================
// Web Speech API ヘルパー
// ==============================
function speak(text: string) {
  if (typeof window === 'undefined') return
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = 'ja-JP'
  utter.rate = 0.9
  utter.pitch = 1.2
  utter.volume = 1.0
  // 日本語音声を優先
  const voices = window.speechSynthesis.getVoices()
  const jaVoice = voices.find((v) => v.lang.startsWith('ja'))
  if (jaVoice) utter.voice = jaVoice
  window.speechSynthesis.speak(utter)
}

// ==============================
// 紙吹雪
// ==============================
function launchConfetti(level: 'normal' | 'mega' = 'normal') {
  if (level === 'mega') {
    const count = 300
    const defaults = { origin: { y: 0.5 } }
    const fire = (particleRatio: number, opts: confetti.Options) => {
      confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) })
    }
    fire(0.25, { spread: 26, startVelocity: 55, colors: ['#FFD6E7', '#FF9FCA', '#C8A0FF'] })
    fire(0.2, { spread: 60, colors: ['#6EE7B7', '#BAE6FD', '#FFD600'] })
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: ['#FF6FB1', '#A855F7'] })
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2, colors: ['#FFF9C4', '#FFD600'] })
    fire(0.1, { spread: 120, startVelocity: 45, colors: ['#FF7F7A', '#FFD6E7'] })
  } else {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#FF9FCA', '#C8A0FF', '#6EE7B7', '#FFD600', '#FF6FB1'],
    })
  }
}

// ==============================
// スター装飾コンポーネント
// ==============================
function FloatingStars() {
  const stars = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 3,
    size: Math.random() * 16 + 8,
    color: ['#FF9FCA', '#C8A0FF', '#6EE7B7', '#FFD600', '#FF7F7A'][Math.floor(Math.random() * 5)],
  }))

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute"
          style={{ left: `${star.x}%`, top: `${star.y}%` }}
          animate={{
            y: [0, -15, 0],
            opacity: [0.4, 1, 0.4],
            rotate: [0, 180, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3 + star.delay,
            repeat: Infinity,
            delay: star.delay,
            ease: 'easeInOut',
          }}
        >
          <Star style={{ color: star.color, width: star.size, height: star.size }} fill="currentColor" />
        </motion.div>
      ))}
    </div>
  )
}

// ==============================
// キャラクターアニメーション
// ==============================
interface CharacterAnimationProps {
  state: CharState
  size?: number
}

// ダミーのスプライト画像ではなく、生成したイラストを使用します
const REAL_SPRITE_URL = `url("/char-sprite.png")`

function CharacterAnimation({ state, size = 200 }: CharacterAnimationProps) {
  const [spriteClass, setSpriteClass] = useState('')
  const [animClass, setAnimClass] = useState('')
  
  useEffect(() => {
    switch (state) {
      case 'waiting':
        setSpriteClass('sprite-row-1')
        setAnimClass('sprite-anim-2')
        break
      case 'running':
        setSpriteClass('sprite-row-2')
        setAnimClass('sprite-anim-2')
        break
      case 'panic':
        setSpriteClass('sprite-row-3')
        setAnimClass('sprite-anim-2-fast')
        break
      case 'clear':
        setSpriteClass('sprite-row-4')
        setAnimClass('') // ジャンプは1フレームなのでX軸のアニメーションは不要
        break
    }
  }, [state])

  // Framer Motionでの複雑な動き (全体コンテナ用)
  const motionAnim = state === 'clear'
    ? { y: [0, -60, 0], scale: [1, 1.05, 1] } // 大きな縦バウンド
    : state === 'panic'
    ? { x: [-30, 30, -30], y: [0, -5, 0] }   // 画面内左右往復
    : state === 'waiting'
    ? { y: [0, -10, 0] }                     // ゆっくりした上下動
    : { y: [0, -5, 0] }                      // 普段のリズミカルな上下動 (running)

  const motionTransition: any = state === 'clear'
    ? { duration: 0.8, repeat: Infinity, repeatDelay: 0.2, ease: 'easeOut' }
    : state === 'panic'
    ? { duration: 0.6, repeat: Infinity, ease: 'linear' }
    : state === 'waiting'
    ? { duration: 3, repeat: Infinity, ease: 'easeInOut' }
    : { duration: 1, repeat: Infinity, ease: 'easeInOut' } // running用

  // キャラクター自体の震えエフェクト (panic時のみ)
  const shakeAnim = state === 'panic'
    ? { rotate: [-4, 4, -4], scale: [0.95, 1.05, 0.95] }
    : { rotate: 0, scale: 1 }

  return (
    <motion.div
      animate={motionAnim}
      transition={motionTransition}
      className="relative flex justify-center items-center drop-shadow-2xl"
      style={{ width: size, height: size }}
    >
      <motion.div
        animate={shakeAnim}
        transition={{ duration: 0.15, repeat: Infinity }}
        className={`sprite-char ${spriteClass} ${animClass} rounded-2xl overflow-hidden shadow-inner border-4 border-white/50`}
        style={{ width: '100%', height: '100%', backgroundImage: REAL_SPRITE_URL }}
      />
      
      {/* 待機中のZzzエフェクト */}
      {state === 'waiting' && (
        <motion.div
          animate={{ opacity: [0, 1, 0], y: [0, -30], x: [0, 10] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-8 right-0 text-3xl font-black text-sky-400 drop-shadow-md z-10"
        >
          Zzz
        </motion.div>
      )}
    </motion.div>
  )
}

// ==============================
// タスクカードコンポーネント
// ==============================
interface TaskCardProps {
  task: Task
  state: TaskState
  isCurrentIdx: number
  myIdx: number
  onClick: () => void
}

function TaskCard({ task, state, isCurrentIdx, myIdx, onClick }: TaskCardProps) {
  const isDone = state === 'done'
  const isCurrent = isCurrentIdx === myIdx
  const isLocked = myIdx > isCurrentIdx && !isDone

  return (
    <motion.div
      layout
      whileHover={!isLocked ? { scale: 1.03, y: -2 } : {}}
      whileTap={!isLocked ? { scale: 0.97 } : {}}
      className={`
        relative rounded-2xl border-2 p-3 cursor-pointer select-none
        transition-all duration-300 overflow-hidden
        ${isDone ? 'opacity-75' : isLocked ? 'opacity-40 cursor-not-allowed' : 'opacity-100'}
        ${isCurrent ? `border-2 ${task.borderColor} shadow-lg` : `border-transparent`}
        bg-gradient-to-br ${task.bgColor}
      `}
      onClick={!isLocked ? onClick : undefined}
    >
      {isCurrent && (
        <motion.div
          className="absolute inset-0 rounded-2xl"
          animate={{ opacity: [0, 0.15, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ background: `radial-gradient(circle, ${task.color}40 0%, transparent 70%)` }}
        />
      )}

      <div className="flex items-center gap-2">
        <span className="text-2xl">{task.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-gray-700 truncate">{task.name}</p>
          <p className="text-xs text-gray-500">{task.durationMin}ふん</p>
        </div>
        {isDone ? (
          <CheckCircle2 className="text-emerald-500 flex-shrink-0" size={20} fill="currentColor" />
        ) : isCurrent ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles size={20} style={{ color: task.color }} />
          </motion.div>
        ) : (
          <Clock size={16} className="text-gray-400 flex-shrink-0" />
        )}
      </div>
    </motion.div>
  )
}

// ==============================
// プログレスバーコンポーネント
// ==============================
interface ProgressBarProps {
  remaining: number
  total: number
  isPinch: boolean
  taskColor: string
}

function ProgressBar({ remaining, total, isPinch, taskColor }: ProgressBarProps) {
  const pct = Math.max(0, (remaining / total) * 100)

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-bold text-gray-600 flex items-center gap-1">
          <Clock size={12} />
          のこり
        </span>
        <span className={`text-sm font-black ${isPinch ? 'text-red-500' : 'text-gray-600'}`}>
          {Math.ceil(remaining / 60)}ふん{remaining % 60 > 0 ? `${remaining % 60}びょう` : ''}
        </span>
      </div>
      <div className="w-full h-5 bg-gray-200/60 rounded-full overflow-hidden border border-white/60">
        <motion.div
          className="h-full rounded-full progress-bar-fill"
          style={{
            width: `${pct}%`,
            background: isPinch
              ? 'linear-gradient(90deg, #FF4444, #FF6B6B)'
              : `linear-gradient(90deg, ${taskColor}, ${taskColor}BB)`,
          }}
          animate={isPinch ? { opacity: [1, 0.7, 1] } : {}}
          transition={isPinch ? { duration: 0.5, repeat: Infinity } : {}}
        />
      </div>
    </div>
  )
}

// ==============================
// メインページ
// ==============================
export default function MorningQuestPage() {
  const [currentTaskIdx, setCurrentTaskIdx] = useState(0)
  const [taskStates, setTaskStates] = useState<TaskState[]>(TASKS.map((_, i) => (i === 0 ? 'active' : 'waiting')))
  const [isRunning, setIsRunning] = useState(false)
  const [remainingSec, setRemainingSec] = useState(TASKS[0].durationMin * 60)
  const [charState, setCharState] = useState<CharState>('waiting')
  const [cheerMsg, setCheerMsg] = useState('')
  const [showCheer, setShowCheer] = useState(false)
  const [allDone, setAllDone] = useState(false)
  const [showStartScreen, setShowStartScreen] = useState(true)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const voicesLoadedRef = useRef(false)

  const currentTask = TASKS[currentTaskIdx]

  // 音声一覧を事前ロード
  useEffect(() => {
    if (typeof window === 'undefined') return
    const loadVoices = () => { voicesLoadedRef.current = true }
    window.speechSynthesis.onvoiceschanged = loadVoices
    loadVoices()
    return () => { window.speechSynthesis.onvoiceschanged = null }
  }, [])

  // タイマー
  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }
    timerRef.current = setInterval(() => {
      setRemainingSec((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          handleTaskComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning])

  // ピンチ状態の検出
  useEffect(() => {
    if (!isRunning) return
    const isPinchQuery = remainingSec < 60 && remainingSec > 0
    setCharState(isPinchQuery ? 'panic' : 'running')
  }, [remainingSec, isRunning])

  const handleTaskComplete = useCallback(() => {
    setIsRunning(false)
    setCharState('clear')

    // 紙吹雪
    const isLast = currentTaskIdx === TASKS.length - 1
    launchConfetti(isLast ? 'mega' : 'normal')

    // 完了音声
    const doneMessages = [
      `${currentTask.name}、かんりょう！すごーい！できたね！`,
      `やったね！${currentTask.name}がおわったよ！きみはさいこう！`,
      `かんぺき！${currentTask.name}クリア！まほうがふえたよ！`,
    ]
    speak(doneMessages[Math.floor(Math.random() * doneMessages.length)])

    setTaskStates((prev) => {
      const next = [...prev]
      next[currentTaskIdx] = 'done'
      return next
    })

    if (isLast) {
      setAllDone(true)
      setTimeout(() => setCharState('clear'), 100)
    } else {
      // 応援メッセージ表示
      const msg = CHEER_MESSAGES[Math.floor(Math.random() * CHEER_MESSAGES.length)]
      setCheerMsg(msg)
      setShowCheer(true)
      setTimeout(() => setShowCheer(false), 3000)
    }
  }, [currentTaskIdx, currentTask])

  const handleStartTask = () => {
    setIsRunning(true)
    setCharState('running')
    const startMessages = [
      `つぎは${currentTask.name}だよ！${currentTask.durationMin}ふんでできるかな？がんばれ！`,
      `${currentTask.name}のじかんだよ！はりきっていこう！`,
      `${currentTask.name}スタート！きみならできるよ！`,
    ]
    speak(startMessages[Math.floor(Math.random() * startMessages.length)])
  }

  const handleNextTask = () => {
    if (currentTaskIdx >= TASKS.length - 1) return
    const next = currentTaskIdx + 1
    setCurrentTaskIdx(next)
    setRemainingSec(TASKS[next].durationMin * 60)
    setCharState('waiting')
    setTaskStates((prev) => {
      const s = [...prev]
      if (s[next] === 'waiting') s[next] = 'active'
      return s
    })
  }

  const handleTaskClick = (idx: number) => {
    if (idx > currentTaskIdx) return
    if (isRunning) return
    setCurrentTaskIdx(idx)
    setRemainingSec(TASKS[idx].durationMin * 60)
    setCharState(taskStates[idx] === 'done' ? 'clear' : 'waiting')
  }

  const handleReset = () => {
    setIsRunning(false)
    setCurrentTaskIdx(0)
    setRemainingSec(TASKS[0].durationMin * 60)
    setTaskStates(TASKS.map((_, i) => (i === 0 ? 'active' : 'waiting')))
    setCharState('waiting')
    setAllDone(false)
    setShowCheer(false)
    setShowStartScreen(true)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  const handleStart = () => {
    setShowStartScreen(false)
    speak('まほうのあさクエストをはじめるよ！いっしょにがんばろうね！')
  }

  const isPinch = remainingSec < 60 && remainingSec > 0 && isRunning
  const completedCount = taskStates.filter((s) => s === 'done').length
  const totalProgress = (completedCount / TASKS.length) * 100

  // ==============================
  // スタートスクリーン
  // ==============================
  if (showStartScreen) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4">
        <FloatingStars />
        <div className="z-10 flex flex-col items-center gap-6 text-center max-w-lg w-full">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <CharacterAnimation state="waiting" size={220} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h1 className="text-4xl font-black mb-2 shimmer-text leading-tight">
              まほうの<br />あさクエスト
            </h1>
            <p className="text-gray-600 font-bold text-lg leading-relaxed">
              ✨ まいあさのじゅんびを<br />
              まほうのチカラでクリアしよう！
            </p>
          </motion.div>

          <motion.div
            className="glass-card p-4 w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-sm font-bold text-gray-600 mb-3">🗺️ きょうのクエスト</p>
            <div className="space-y-2">
              {TASKS.map((task) => (
                <div key={task.id} className="flex items-center gap-3 text-left">
                  <span className="text-xl">{task.emoji}</span>
                  <span className="font-bold text-gray-700 text-sm">{task.name}</span>
                  <span className="ml-auto text-xs text-gray-500">{task.durationMin}ふん</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.button
            id="start-button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, type: 'spring', stiffness: 300 }}
            whileHover={{ scale: 1.08, y: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStart}
            className="
              w-full py-5 rounded-3xl font-black text-xl text-white
              bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400
              shadow-lg shadow-pink-300/50 pulse-glow
              flex items-center justify-center gap-3
            "
          >
            <Sparkles size={24} />
            クエストをはじめる！
            <Sparkles size={24} />
          </motion.button>
        </div>
      </div>
    )
  }

  // ==============================
  // 全完了スクリーン
  // ==============================
  if (allDone) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4">
        <FloatingStars />
        <div className="z-10 flex flex-col items-center gap-6 text-center max-w-lg w-full">
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <CharacterAnimation state="clear" size={240} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <h2 className="text-5xl font-black shimmer-text mb-3">
              🎉 ぜんぶクリア！ 🎉
            </h2>
            <p className="text-xl font-bold text-gray-600 leading-relaxed">
              すごーい！きょうのじゅんびが<br />
              かんぺきに おわったよ！<br />
              <span className="text-pink-500">きみはまほうつかいの ほし⭐</span>
            </p>
          </motion.div>

          <div className="glass-card p-4 w-full">
            <p className="font-black text-gray-700 mb-3">✅ きょうのきろく</p>
            {TASKS.map((task) => (
              <div key={task.id} className="flex items-center gap-2 py-1">
                <CheckCircle2 size={18} className="text-emerald-500" fill="currentColor" />
                <span className="font-bold text-gray-700 text-sm">{task.emoji} {task.name}</span>
                <span className="ml-auto text-xs text-emerald-600 font-bold">クリア！</span>
              </div>
            ))}
          </div>

          <motion.button
            id="reset-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="
              w-full py-4 rounded-3xl font-bold text-gray-600 text-lg
              bg-white/70 border-2 border-gray-200
              flex items-center justify-center gap-2 shadow
            "
          >
            <RotateCcw size={20} />
            もういちどはじめる
          </motion.button>
        </div>
      </div>
    )
  }

  // ==============================
  // メイン画面
  // ==============================
  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingStars />

      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row gap-0 p-3 sm:p-4 max-w-5xl mx-auto">

        {/* ===== 左パネル: タスクリスト ===== */}
        <div className="lg:w-72 flex-shrink-0 flex flex-col gap-3 order-2 lg:order-1">

          {/* 全体進捗 */}
          <motion.div
            className="glass-card p-4"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-black text-gray-700 text-sm flex items-center gap-1">
                <Star size={14} fill="currentColor" className="text-yellow-400" />
                ぜんたいのすすみぐあい
              </span>
              <span className="text-sm font-black text-purple-500">{completedCount}/{TASKS.length}</span>
            </div>
            <div className="w-full h-4 bg-gray-200/60 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #FF9FCA, #C8A0FF, #6EE7B7)',
                  width: `${totalProgress}%`,
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="flex justify-end mt-1">
              <span className="text-xs text-gray-500">{Math.round(totalProgress)}%</span>
            </div>
          </motion.div>

          {/* タスクカードリスト */}
          <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-1 lg:pb-0">
            {TASKS.map((task, idx) => (
              <div key={task.id} className="flex-shrink-0 lg:flex-shrink w-36 sm:w-44 lg:w-full">
                <TaskCard
                  task={task}
                  state={taskStates[idx]}
                  isCurrentIdx={currentTaskIdx}
                  myIdx={idx}
                  onClick={() => handleTaskClick(idx)}
                />
              </div>
            ))}
          </div>

          {/* リセットボタン */}
          <motion.button
            id="reset-small-button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleReset}
            className="glass-card px-3 py-2 text-xs text-gray-500 flex items-center justify-center gap-1 font-bold hidden lg:flex"
          >
            <RotateCcw size={12} />
            はじめからやりなおす
          </motion.button>
        </div>

        {/* ===== 右パネル: メインエリア ===== */}
        <div className="flex-1 flex flex-col gap-3 order-1 lg:order-2 lg:pl-4">

          {/* ヘッダー */}
          <motion.div
            className="glass-card p-3 flex items-center justify-between"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <h1 className="font-black text-lg shimmer-text">✨ あさクエスト</h1>
            <div className="flex items-center gap-2">
              {Array.from({ length: TASKS.length }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 rounded-full"
                  style={{
                    background: i < completedCount
                      ? 'linear-gradient(135deg, #6EE7B7, #C8A0FF)'
                      : i === currentTaskIdx
                      ? TASKS[i].color
                      : '#E5E7EB',
                  }}
                  animate={i === currentTaskIdx ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              ))}
            </div>
          </motion.div>

          {/* メインカード */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTaskIdx}
              className="glass-card p-4 sm:p-6 flex-1 flex flex-col gap-4"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
            >
              {/* タスク名 */}
              <div className="flex items-center gap-3">
                <span className="text-5xl">{currentTask.emoji}</span>
                <div>
                  <p className="text-xs font-bold text-gray-500">
                    ミッション {currentTaskIdx + 1}/{TASKS.length}
                  </p>
                  <h2 className="text-3xl font-black text-gray-800">{currentTask.name}</h2>
                  <p className="text-sm text-gray-500 font-bold">{currentTask.description}</p>
                </div>
              </div>

              {/* キャラクター */}
              <div className="flex-1 flex items-center justify-center py-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={charState}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative"
                  >
                    <CharacterAnimation state={charState} size={200} />

                    {/* ピンチ時の点滅エフェクト */}
                    {isPinch && (
                      <motion.div
                        className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-black px-2 py-1 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.4, repeat: Infinity }}
                      >
                        いそいで！
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* プログレスバー */}
              {isRunning && (
                <ProgressBar
                  remaining={remainingSec}
                  total={currentTask.durationMin * 60}
                  isPinch={isPinch}
                  taskColor={currentTask.color}
                />
              )}

              {/* ボタンエリア */}
              <div className="flex flex-col sm:flex-row gap-3">
                {taskStates[currentTaskIdx] !== 'done' ? (
                  !isRunning ? (
                    <motion.button
                      id="start-task-button"
                      whileHover={{ scale: 1.04, y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={handleStartTask}
                      className="
                        flex-1 py-5 rounded-3xl font-black text-xl text-white
                        shadow-lg flex items-center justify-center gap-2
                        pulse-glow
                      "
                      style={{
                        background: `linear-gradient(135deg, ${currentTask.color}, ${currentTask.color}AA)`,
                        boxShadow: `0 8px 24px ${currentTask.color}50`,
                      }}
                    >
                      <Sparkles size={22} />
                      {currentTask.name}をはじめる！
                    </motion.button>
                  ) : (
                    <motion.button
                      id="complete-task-button"
                      whileHover={{ scale: 1.04, y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={handleTaskComplete}
                      className="
                        flex-1 py-5 rounded-3xl font-black text-xl text-white
                        bg-gradient-to-r from-emerald-400 to-teal-400
                        shadow-lg shadow-emerald-300/50 flex items-center justify-center gap-2
                      "
                    >
                      <CheckCircle2 size={22} />
                      できた！
                    </motion.button>
                  )
                ) : currentTaskIdx < TASKS.length - 1 ? (
                  <motion.button
                    id="next-task-button"
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={handleNextTask}
                    className="
                      flex-1 py-5 rounded-3xl font-black text-xl text-white
                      bg-gradient-to-r from-purple-400 to-pink-400
                      shadow-lg flex items-center justify-center gap-2
                    "
                  >
                    つぎへ！
                    <ChevronRight size={22} />
                  </motion.button>
                ) : null}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* モバイル用リセットボタン */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleReset}
            className="glass-card px-3 py-2 text-xs text-gray-500 flex items-center justify-center gap-1 font-bold lg:hidden"
          >
            <RotateCcw size={12} />
            はじめからやりなおす
          </motion.button>
        </div>
      </div>

      {/* 応援メッセージポップアップ */}
      <AnimatePresence>
        {showCheer && (
          <motion.div
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50"
            initial={{ opacity: 0, y: -30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <div className="glass-card px-6 py-4 text-center shadow-2xl border-2 border-pink-300">
              <p className="font-black text-gray-700 text-lg">{cheerMsg}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
