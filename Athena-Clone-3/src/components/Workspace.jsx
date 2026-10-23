import { useRef, useState } from 'react'
import { motion, MotionConfig, useReducedMotion } from 'framer-motion'
import { layoutSpring } from '../animation/transitions'
import Icon from './Icon'
import MotionButton from './MotionButton'
import PageReveal from './PageReveal'
import HookSidebar from './devclub/HookSidebar'
import CandyButton from './devclub/CandyButton'

const stages = [
  { id: 'setup', label: 'Setup', icon: 'grid' },
  { id: 'exam', label: 'Assessment', icon: 'document' },
  { id: 'result', label: 'Results', icon: 'chart' },
]

export default function Workspace({ screen, onNavigate, navigationDisabled, children }) {
  const dialogRef = useRef(null)
  const [guideTopic, setGuideTopic] = useState('guide')
  const [guideOpen, setGuideOpen] = useState(false)
  const reducedMotion = useReducedMotion()
  const activeIndex = stages.findIndex((stage) => stage.id === screen)

  function openGuide(topic = 'guide') {
    setGuideTopic(topic)
    setGuideOpen(true)
    dialogRef.current.showModal()
  }

  return (
    <MotionConfig reducedMotion="user" transition={layoutSpring}>
      <div className="workspace">
        <aside className="sidebar">
          <a className="brand" href="#main-content" aria-label="Athena, skip to content">
            <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>athena<span className="brand-period">.</span>
          </a>
          <div className="sidebar-body">
            <div className="sidebar-section">
              <p className="sidebar-label">Workspace</p>
              <HookSidebar items={stages} value={activeIndex} onChange={(index) => onNavigate(stages[index].id)} disabled={navigationDisabled} />
            </div>
            <div className="sidebar-section sidebar-resources">
              <p className="sidebar-label">Resources</p>
              <div className="resource-list">
                <MotionButton onClick={() => openGuide()}><Icon name="book" size={19} />Assessment guide</MotionButton>
                <MotionButton onClick={() => openGuide('privacy')}><Icon name="shield" size={19} />Privacy & camera</MotionButton>
              </div>
            </div>
          </div>
        </aside>
        <div className="workspace-body">
          <header className="topbar">
            <div className="workspace-title"><Icon name="grid" size={17} /><span>Workspace</span><Icon name="chevron" size={13} /><strong>{stages[activeIndex]?.label}</strong></div>
            <MotionButton className="help-button" onClick={() => openGuide()}><Icon name="help" size={17} /><span>Help & guidelines</span></MotionButton>
          </header>
          <main id="main-content" className="main-content" tabIndex={-1}><PageReveal key={screen}>{children}</PageReveal></main>
        </div>
        <dialog ref={dialogRef} className="guide-dialog" aria-labelledby="guide-title" onClose={() => setGuideOpen(false)} onClick={(event) => { if (event.target === event.currentTarget) dialogRef.current.close() }}>
          <motion.div className="guide-content" initial={false} animate={guideOpen || reducedMotion ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.985, y: 8 }} transition={reducedMotion ? { duration: 0 } : { ...layoutSpring, opacity: { duration: 0.14 } }}>
            <div className="dialog-heading"><MotionButton className="icon-button" aria-label="Close guide" onClick={() => dialogRef.current.close()}><Icon name="close" /></MotionButton></div>
            <h2 id="guide-title">{guideTopic === 'privacy' ? 'Privacy & camera' : 'Assessment guidelines'}</h2>
            {guideTopic === 'privacy' ? <div className="privacy-guide"><p>Your camera stays connected while you take the assessment. You can see its status and preview in your workspace.</p><p>In the desktop app, camera snapshots are saved on this device during the assessment. Camera tracks are stopped when you submit or close the app.</p><p>Your name and answers are sent to the configured assessment service when you start and complete the test.</p></div> : <ol className="guide-list"><li>Find a quiet place and keep your camera connected.</li><li>Stay in full screen and work independently.</li><li>Select an answer to save it. Saved answers cannot be changed.</li><li>You can move between questions before submitting.</li><li>Submit your assessment when you have finished reviewing your answers.</li></ol>}
            <CandyButton className="btn btn-primary" onClick={() => dialogRef.current.close()}>Got it<Icon name="check" size={17} /></CandyButton>
          </motion.div>
        </dialog>
      </div>
    </MotionConfig>
  )
}
