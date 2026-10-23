import { useEffect, useRef, useState } from 'react'
import Workspace from './components/Workspace'
import SetupScreen from './screens/SetupScreen'
import ExamScreen from './screens/ExamScreen'
import ResultScreen from './screens/ResultScreen'
import WorkspaceStatusScreen from './screens/WorkspaceStatusScreen'
import './App.css'
import './components/Workspace.css'
import './motion.css'
import './components/devclub/devclub.css'

const API_BASE_URL = window.athena?.isPackaged ? window.location.origin : import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || 'Something went wrong. Please try again.')
  return data
}

function App() {
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [fullScreen, setFullScreen] = useState(Boolean(document.fullscreenElement))
  const [timer, setTimer] = useState(0)
  const [name, setName] = useState('')
  const [screen, setScreen] = useState('setup')
  const [sessionId, setSessionId] = useState('')
  const [questions, setQuestions] = useState([])
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [progress, setProgress] = useState({ attempted: 0, correct: 0, wrong: 0 })
  const [result, setResult] = useState(null)
  const [pending, setPending] = useState('')
  const [error, setError] = useState('')
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const sessionActiveRef = useRef(false)
  const sessionStatus = result ? 'submitted' : sessionId ? 'in-progress' : 'not-started'
  const sessionActive = sessionStatus === 'in-progress'

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = streamRef.current
    document.getElementById('main-content')?.focus({ preventScroll: true })
    window.scrollTo(0, 0)
  }, [screen])

  useEffect(() => {
    sessionActiveRef.current = sessionActive
  }, [sessionActive])

  useEffect(() => {
    const updateFullScreen = () => setFullScreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', updateFullScreen)
    return () => {
      document.removeEventListener('fullscreenchange', updateFullScreen)
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  useEffect(() => {
    const athena = window.athena
    if (!athena) return undefined
    const removeTimer = athena.registerListenerForTimerTickFromMain((value) => {
      if (sessionActiveRef.current) setTimer(value)
    })
    const removeSnap = athena.registerListenerForCameraSnapFromMain(async () => {
      if (!sessionActiveRef.current) return
      const track = streamRef.current?.getVideoTracks()[0]
      if (!track) return
      try {
        const blob = await new ImageCapture(track).takePhoto()
        await athena.storeCameraSnapImageOnDisk(await blob.arrayBuffer())
      } catch {
        setError('A camera snapshot could not be saved. Check that your camera is still connected.')
      }
    })
    return () => { removeTimer(); removeSnap() }
  }, [])

  useEffect(() => {
    if (!sessionActive || window.athena) return undefined
    const started = Date.now()
    const interval = window.setInterval(() => setTimer(Math.floor((Date.now() - started) / 1000)), 1000)
    return () => window.clearInterval(interval)
  }, [sessionActive])

  function navigateToScreen(destination) {
    if (pending || !['setup', 'exam', 'result'].includes(destination)) return
    setError('')
    setScreen(destination)
  }

  async function getCameraAccess() {
    setPending('camera')
    setError('')
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera access is unavailable. Open the app in a supported browser on a secure connection.')
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      stream.getVideoTracks().forEach((track) => track.addEventListener('ended', () => {
        setCameraEnabled(false)
        setError('Your camera disconnected. Reconnect it before continuing.')
      }, { once: true }))
      setCameraEnabled(true)
    } catch (cameraError) {
      setError(cameraError.name === 'NotAllowedError' ? 'Camera access was blocked. Allow camera access in your browser settings, then try again.' : cameraError.name === 'NotFoundError' ? 'No camera was found. Connect a camera and try again.' : cameraError.message || 'Your camera could not connect. Check that it is available and try again.')
    } finally { setPending('') }
  }

  async function enableFullScreen() {
    setPending('fullscreen')
    setError('')
    try {
      if (!document.documentElement.requestFullscreen) throw new Error('Full screen is unavailable in this browser. Use a supported desktop browser to continue.')
      await document.documentElement.requestFullscreen()
      setFullScreen(Boolean(document.fullscreenElement))
    } catch (fullscreenError) {
      setError(fullscreenError.message || 'Full screen could not be enabled. Try again to continue.')
    } finally { setPending('') }
  }

  async function startExam() {
    if (pending) return
    if (sessionId) { navigateToScreen(result ? 'result' : 'exam'); return }
    if (!name.trim() || !cameraEnabled || !fullScreen || pending) return
    setPending('start')
    setError('')
    try {
      const examQuestions = await request('/exam/mcq')
      if (!Array.isArray(examQuestions) || !examQuestions.length) throw new Error('There are no questions available for this assessment.')
      const session = await request('/exam/start', { method: 'POST', body: JSON.stringify({ userId: `student-${Date.now()}`, name: name.trim() }) })
      setSessionId(session.sessionId)
      setName(name.trim())
      setQuestions(examQuestions)
      setScreen('exam')
      if (window.athena) window.athena.startTimerOnMain().catch(() => setError('The assessment timer could not start.'))
    } catch (startError) {
      setError(startError instanceof TypeError ? 'We couldn’t reach the assessment service. Check your connection and try again.' : startError.message)
    } finally { setPending('') }
  }

  async function answerQuestion(optionIndex) {
    const question = questions[questionIndex]
    if (!sessionActive || !question || answers[question.id] !== undefined || pending) return
    setPending('answer')
    setError('')
    try {
      const updated = await request('/exam/answer', { method: 'POST', body: JSON.stringify({ sessionId, questionId: question.id, selectedAnswer: optionIndex }) })
      setAnswers((current) => ({ ...current, [question.id]: optionIndex }))
      setProgress(updated)
    } catch (answerError) { setError(answerError.message) } finally { setPending('') }
  }

  async function submitExam() {
    if (!sessionActive || pending) return
    setPending('submit')
    setError('')
    try {
      const submission = await request('/exam/submit', { method: 'POST', body: JSON.stringify({ sessionId }) })
      if (window.athena) await window.athena.stopTimerOnMain()
      setResult(submission.result)
      setScreen('result')
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
      setCameraEnabled(false)
    } catch (submitError) { setError(submitError.message) } finally { setPending('') }
  }

  return <Workspace screen={screen} onNavigate={navigateToScreen} navigationDisabled={Boolean(pending)}>
    {screen === 'setup' && <SetupScreen {...{ name, setName, cameraEnabled, fullScreen, getCameraAccess, enableFullScreen, videoRef, pending, error, startExam, sessionStatus }} />}
    {screen === 'exam' && sessionActive && <ExamScreen {...{ name, questions, questionIndex, setQuestionIndex, answers, progress, timer, pending, error, answerQuestion, submitExam, cameraEnabled, fullScreen, videoRef, enableFullScreen, getCameraAccess }} />}
    {screen === 'exam' && !sessionActive && <WorkspaceStatusScreen destination="exam" {...{ sessionStatus, name, cameraEnabled, fullScreen, progress, pending, error, startExam }} total={questions.length} onNavigate={navigateToScreen} />}
    {screen === 'result' && result && <ResultScreen name={name} result={result} total={questions.length} />}
    {screen === 'result' && !result && <WorkspaceStatusScreen destination="result" {...{ sessionStatus, name, cameraEnabled, fullScreen, progress, pending, error, startExam }} total={questions.length} onNavigate={navigateToScreen} />}
  </Workspace>
}

export default App
