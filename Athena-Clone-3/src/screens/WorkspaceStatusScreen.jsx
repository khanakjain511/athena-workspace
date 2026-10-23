import Icon from '../components/Icon'
import CandyButton from '../components/devclub/CandyButton'

export default function WorkspaceStatusScreen({ destination, sessionStatus, name, cameraEnabled, fullScreen, progress, total, pending, error, startExam, onNavigate }) {
  const resultsView = destination === 'result'
  const inProgress = sessionStatus === 'in-progress'
  const submitted = sessionStatus === 'submitted'
  const ready = Boolean(name.trim()) && cameraEnabled && fullScreen
  const canStart = !resultsView && !submitted && ready
  const title = submitted ? 'Assessment completed' : resultsView ? inProgress ? 'Your assessment is in progress' : 'No results yet' : 'Set up your assessment'
  const description = submitted ? 'Your responses have been submitted. Open Results to review your performance.' : resultsView ? inProgress ? `${progress.attempted} of ${total} questions answered. Your results will be available after submission.` : 'Your score and answer breakdown will appear here after you submit an assessment.' : 'Enter your name, connect your camera, and enable full screen in Setup before beginning.'
  const actionLabel = submitted ? 'View results' : resultsView ? inProgress ? 'Return to assessment' : 'Go to assessment' : canStart ? 'Begin assessment' : 'Go to setup'

  function continueToDestination() {
    if (canStart) { startExam(); return }
    onNavigate(submitted ? 'result' : resultsView ? 'exam' : 'setup')
  }

  return (
    <>
      <section className="page-heading"><div><h1>{resultsView ? 'Assessment results' : 'Your assessment'}</h1><p>{resultsView ? 'Review your submitted assessment results.' : 'Manage your assessment from this workspace.'}</p></div></section>
      <section className="workspace-status-panel" aria-labelledby="workspace-status-title">
        <span className="workspace-status-icon"><Icon name={submitted ? 'check' : resultsView ? 'chart' : 'document'} size={28} /></span>
        <h2 id="workspace-status-title">{title}</h2>
        <p>{description}</p>
        {!resultsView && !submitted && <dl className="status-checks"><div><dt>Candidate</dt><dd>{name.trim() || 'Not entered'}</dd></div><div><dt>Camera</dt><dd>{cameraEnabled ? 'Connected' : 'Not connected'}</dd></div><div><dt>Full screen</dt><dd>{fullScreen ? 'Enabled' : 'Not enabled'}</dd></div></dl>}
        <CandyButton className="btn btn-primary" disabled={Boolean(pending)} onClick={continueToDestination}>{pending === 'start' ? 'Preparing assessment…' : actionLabel}<Icon name="arrow" size={17} /></CandyButton>
      </section>
      {error && <div className="error-message" role="alert">{error}</div>}
    </>
  )
}
