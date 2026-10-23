import { createRoot } from 'react-dom/client'
import App from '../src/App'
import { checkWorkspaceNavigation } from './navigation-regression'
import '../src/index.css'

const params = new URLSearchParams(window.location.search)
if (params.get('motion') === 'reduced') {
  const matchMedia = window.matchMedia.bind(window)
  window.matchMedia = (query) => {
    const media = matchMedia(query)
    if (query.includes('prefers-reduced-motion')) Object.defineProperty(media, 'matches', { value: !query.includes('no-preference') })
    return media
  }
}
const questions = [
  { id: 1, question: 'Which approach helps create a clear, accessible interface?', options: ['Use a consistent layout and readable text', 'Hide navigation on every screen', 'Use colour as the only status indicator', 'Remove keyboard focus indicators'] },
  { id: 2, question: 'What is the best next step after completing an assessment?', options: ['Close it before submitting', 'Submit your answers and review your results', 'Change saved answers without confirmation', 'Disconnect before saving'] },
]
const savedAnswers = new Map()
let failNextRequest = false
let fullscreenElement = null
let currentTrack = null
const controls = document.getElementById('test-controls')
controls.style.cssText = 'padding:12px 20px;background:#f3efdd;color:#514b2c;display:flex;gap:20px;align-items:center;font:12px Arial;flex-wrap:wrap;'
const label = document.createElement('strong')
label.textContent = 'UI TEST HARNESS — simulated camera and API'
controls.append(label)
for (const [text, action] of [
  ['Fail next API request', () => { failNextRequest = true }],
  ['Simulate fullscreen exit', () => { fullscreenElement = null; document.dispatchEvent(new Event('fullscreenchange')) }],
  ['Simulate camera disconnect', () => { currentTrack?.stop(); currentTrack?.dispatchEvent(new Event('ended')) }],
]) {
  const button = document.createElement('button')
  button.textContent = text
  button.addEventListener('click', action)
  controls.append(button)
}
Object.defineProperty(document, 'fullscreenElement', { configurable: true, get: () => fullscreenElement })
document.documentElement.requestFullscreen = async () => {
  fullscreenElement = document.documentElement
  document.dispatchEvent(new Event('fullscreenchange'))
}
navigator.mediaDevices.getUserMedia = async () => {
  if (params.get('camera') === 'denied') throw new DOMException('Camera permission denied', 'NotAllowedError')
  const canvas = document.createElement('canvas')
  canvas.width = 640
  canvas.height = 360
  const context = canvas.getContext('2d')
  context.fillStyle = '#344c39'
  context.fillRect(0, 0, 640, 360)
  context.fillStyle = '#dfe9d8'
  context.font = '24px sans-serif'
  context.textAlign = 'center'
  context.fillText('Simulated camera for UI validation', 320, 180)
  const stream = canvas.captureStream()
  currentTrack = stream.getVideoTracks()[0]
  return stream
}
window.fetch = async (url, options = {}) => {
  if (failNextRequest) {
    failNextRequest = false
    return Response.json({ message: 'Test service unavailable. Please retry.' }, { status: 503 })
  }
  const path = new URL(url, window.location.origin).pathname
  const body = options.body ? JSON.parse(options.body) : {}
  if (path === '/exam/mcq') return Response.json(params.get('questions') === 'empty' ? [] : questions)
  if (path === '/exam/start') return Response.json({ sessionId: 'ui-test-session' })
  if (path === '/exam/answer') {
    if (savedAnswers.has(body.questionId)) return Response.json({ message: 'Question already answered' }, { status: 400 })
    savedAnswers.set(body.questionId, body.selectedAnswer)
    return Response.json(getResult())
  }
  if (path === '/exam/submit') return Response.json({ result: getResult() })
  return Response.json({ message: 'Unexpected test request' }, { status: 404 })
}
function getResult() {
  const correct = Number(savedAnswers.get(1) === 0) + Number(savedAnswers.get(2) === 1)
  return { attempted: savedAnswers.size, correct, wrong: savedAnswers.size - correct }
}
const root = document.getElementById('root')
const navigationStatus = document.createElement('output')
navigationStatus.id = 'navigation-regression'
navigationStatus.setAttribute('aria-live', 'polite')
controls.append(navigationStatus)
const updateNavigationCheck = () => {
  const result = checkWorkspaceNavigation(root)
  navigationStatus.dataset.pass = String(result.pass)
  navigationStatus.textContent = result.pass ? 'PASS: workspace navigation' : `FAIL: ${result.checks.filter((check) => !check.pass).map((check) => check.name).join(', ')}`
}
const navigationObserver = new MutationObserver(updateNavigationCheck)
navigationObserver.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-current'] })
window.addEventListener('pagehide', () => navigationObserver.disconnect(), { once: true })
createRoot(root).render(<App />)
