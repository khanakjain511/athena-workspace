import { useState } from 'react'
import { LayoutGroup, motion, useReducedMotion } from 'framer-motion'
import MotionButton from '../components/MotionButton'
import Icon from '../components/Icon'
import CameraPreview from '../components/CameraPreview'
import MetricCard from '../components/MetricCard'
import CandyButton from '../components/devclub/CandyButton'
import SegmentedProgress from '../components/devclub/SegmentedProgress'

export default function SetupScreen({ name, setName, cameraEnabled, fullScreen, getCameraAccess, enableFullScreen, videoRef, pending, error, startExam, sessionStatus }) {
  const [activeSection, setActiveSection] = useState('checks')
  const reducedMotion = useReducedMotion()
  const completed = Number(Boolean(name.trim())) + Number(cameraEnabled) + Number(fullScreen)
  const ready = completed === 3
  const hasSession = sessionStatus !== 'not-started'
  const submitted = sessionStatus === 'submitted'

  return (
    <>
      <section className="page-heading">
        <div><h1>Assessment setup</h1><p>{hasSession ? 'Review the workspace configuration for your assessment.' : 'Let’s make sure everything is ready before you begin.'}</p></div>
        <div className={`heading-status ${ready ? 'is-complete' : ''}`}><span className={`status-dot ${ready ? 'online' : ''}`} />{submitted ? 'Submitted' : hasSession ? 'Assessment in progress' : ready ? 'Ready to begin' : 'Setup in progress'}</div>
      </section>
      <div className="metrics-grid">
        <MetricCard label="Setup progress" value={submitted ? 'Submitted' : <>{completed}<span className="metric-denominator"> / 3</span></>} detail={submitted ? 'Assessment complete' : 'Required checks completed'} icon="grid" complete={submitted || ready} />
        <MetricCard label="Camera status" value={submitted ? 'Released' : cameraEnabled ? 'Connected' : 'Not connected'} detail={submitted ? 'Camera stopped after submission' : cameraEnabled ? 'Your camera is ready' : 'Camera permission required'} icon="camera" complete={cameraEnabled} />
        <MetricCard label="Display mode" value={fullScreen ? 'Full screen' : 'Windowed'} detail={submitted ? 'Full screen is no longer required' : fullScreen ? 'Distraction-free mode enabled' : 'Full screen required'} icon="screen" complete={fullScreen} />
      </div>
      <div className="setup-layout">
        <section className="setup-panel" aria-labelledby="checklist-title">
          <div className="panel-heading"><div><h2 id="checklist-title">{hasSession ? 'Workspace configuration' : 'Configure your workspace'}</h2><p>{submitted ? 'Settings from your completed assessment.' : hasSession ? 'Review your active assessment settings.' : 'Complete the checks below to access your assessment.'}</p></div><span className="panel-icon"><Icon name="settings" size={19} /></span></div>
          {!submitted && <div className="setup-readiness"><SegmentedProgress value={completed / 3 * 100} label="Setup completion" /></div>}
          <LayoutGroup id="setup-sections"><div className="section-tabs" aria-label="Setup information"><MotionButton className={activeSection === 'checks' ? 'active' : ''} aria-pressed={activeSection === 'checks'} onClick={() => setActiveSection('checks')}>Setup checklist{!submitted && <span>{completed}/3</span>}{activeSection === 'checks' && <motion.i className="tab-indicator" layoutId="active-setup-section" aria-hidden="true" />}</MotionButton><MotionButton className={activeSection === 'guidelines' ? 'active' : ''} aria-pressed={activeSection === 'guidelines'} onClick={() => setActiveSection('guidelines')}>Guidelines{activeSection === 'guidelines' && <motion.i className="tab-indicator" layoutId="active-setup-section" aria-hidden="true" />}</MotionButton></div></LayoutGroup>
          <motion.div key={activeSection} initial={reducedMotion ? false : { opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : 0.2, ease: 'easeOut' }}>
          {activeSection === 'checks' ? <div className="checklist-body">
            <div className="checklist-row"><span className={`step-index ${name.trim() ? 'done' : ''}`}>{name.trim() ? <Icon name="check" size={16} /> : '01'}</span><div className="checklist-content"><div className="step-heading"><h3>Candidate details</h3><span>Required</span></div><p>Your name will be included with your assessment results.</p><label htmlFor="candidate-name">Full name</label><input id="candidate-name" className="name-input" value={name} onChange={(event) => setName(event.target.value)} placeholder="Enter your full name" autoComplete="name" maxLength={120} readOnly={hasSession} required /></div></div>
            <div className="checklist-row"><span className={`step-index ${cameraEnabled ? 'done' : ''}`}>{cameraEnabled ? <Icon name="check" size={16} /> : '02'}</span><div className="checklist-content"><div className="step-heading"><h3>Camera access</h3><span className={cameraEnabled ? 'text-success' : ''}>{submitted ? 'Released' : cameraEnabled ? 'Connected' : 'Required'}</span></div><p>{submitted ? 'Camera access ended when you submitted this assessment.' : 'Enable your camera and keep your face clearly visible.'}</p><CandyButton variant={cameraEnabled ? 'mint' : 'pearl'} className={`btn ${cameraEnabled ? 'btn-complete' : 'btn-outline'}`} disabled={submitted || cameraEnabled || Boolean(pending)} onClick={getCameraAccess}><Icon name={cameraEnabled ? 'check' : 'camera'} size={16} />{submitted ? 'Camera released' : cameraEnabled ? 'Camera connected' : pending === 'camera' ? 'Connecting camera…' : 'Connect camera'}{!cameraEnabled && <Icon name="arrow" size={15} />}</CandyButton></div></div>
            <div className="checklist-row"><span className={`step-index ${fullScreen ? 'done' : ''}`}>{fullScreen ? <Icon name="check" size={16} /> : '03'}</span><div className="checklist-content"><div className="step-heading"><h3>Full-screen mode</h3><span className={fullScreen ? 'text-success' : ''}>{fullScreen ? 'Enabled' : 'Required'}</span></div><p>{submitted ? 'Your assessment is complete. Full screen is no longer required.' : 'Switch to full screen for a focused assessment experience.'}</p><CandyButton variant={fullScreen ? 'mint' : 'pearl'} className={`btn ${fullScreen ? 'btn-complete' : 'btn-outline'}`} disabled={submitted || fullScreen || Boolean(pending)} onClick={enableFullScreen}><Icon name={fullScreen ? 'check' : 'screen'} size={16} />{fullScreen ? 'Full screen enabled' : pending === 'fullscreen' ? 'Enabling full screen…' : 'Enable full screen'}{!fullScreen && <Icon name="arrow" size={15} />}</CandyButton></div></div>
          </div> : <div className="inline-guidelines"><h3>A few things before you start</h3><ol><li>Work independently in a quiet, well-lit space.</li><li>Keep your camera connected and remain in full screen.</li><li>Read each question carefully. Selecting an answer saves it immediately.</li><li>Saved answers cannot be changed. You can navigate between questions to review them.</li><li>When you are finished, submit the assessment to see your results.</li></ol><MotionButton className="text-button" onClick={() => setActiveSection('checks')}><Icon name="back" size={16} />Back to setup checklist</MotionButton></div>}
          </motion.div>
        </section>
        <aside className="preparation-aside">
          <CameraPreview videoRef={videoRef} cameraEnabled={cameraEnabled} />
          <section className="details-panel"><div className="panel-heading"><h2>Assessment details</h2><Icon name="document" size={17} /></div><dl className="detail-list"><div><dt>Format</dt><dd>Multiple choice</dd></div><div><dt>Answer saving</dt><dd>Automatic</dd></div><div><dt>Answer policy</dt><dd>One response per question</dd></div></dl></section>
        </aside>
      </div>
      {error && <div className="error-message" role="alert">{error}</div>}
      <div className="start-bar"><div><span className={`start-icon ${ready ? 'is-complete' : ''}`}><Icon name={ready ? 'check' : 'shield'} size={18} /></span><div><strong>{submitted ? 'Assessment complete' : hasSession ? 'Your assessment is in progress' : ready ? 'Your workspace is ready' : 'Complete your setup to continue'}</strong><p>{submitted ? 'Your results are available in the Results workspace.' : hasSession ? 'Continue your existing session with your saved answers and elapsed time.' : ready ? 'All required checks are complete. You can begin your assessment.' : `${3 - completed} ${3 - completed === 1 ? 'check remaining' : 'checks remaining'} before you can begin your assessment.`}</p></div></div><CandyButton className="btn btn-primary btn-start" disabled={(!hasSession && !ready) || Boolean(pending)} onClick={startExam}>{pending === 'start' ? 'Preparing assessment…' : submitted ? 'View results' : hasSession ? 'Return to assessment' : 'Begin assessment'}<Icon name="arrow" size={17} /></CandyButton></div>
    </>
  )
}
