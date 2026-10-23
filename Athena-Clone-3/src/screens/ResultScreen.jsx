import Icon from '../components/Icon'
import MetricCard from '../components/MetricCard'

export default function ResultScreen({ name, result, total }) {
  const attempted = result?.attempted ?? 0
  const correct = result?.correct ?? 0
  const wrong = result?.wrong ?? 0
  const unanswered = Math.max(0, total - attempted)
  const score = total ? Math.round((correct / total) * 100) : 0

  return (
    <>
      <section className="page-heading"><div><h1>Assessment results</h1><p>Your assessment is complete. Here’s a breakdown of your performance.</p></div><div className="heading-status is-complete"><Icon name="check" size={16} />Successfully submitted</div></section>
      <div className="metrics-grid results-metrics">
        <MetricCard label="Overall score" value={<>{score}<span className="metric-denominator">%</span></>} detail="Based on all questions" icon="chart" />
        <MetricCard label="Answered" value={<>{attempted}<span className="metric-denominator"> / {total}</span></>} detail="Questions completed" icon="document" />
        <MetricCard label="Correct answers" value={correct} detail="Answered correctly" icon="check" complete />
        <MetricCard label="Incorrect answers" value={wrong} detail="Answered incorrectly" icon="close" />
      </div>
      <div className="results-layout">
        <section className="performance-panel"><div className="panel-heading"><div><h2>Performance overview</h2></div><Icon name="chart" size={19} /></div><div className="score-display"><strong>{score}<span>%</span></strong><div><span>Overall assessment score</span><p>{correct} of {total} questions answered correctly</p></div></div><div className="performance-bar" role="img" aria-label={`${correct} correct, ${wrong} incorrect, ${unanswered} unanswered out of ${total}`}><span className="correct-segment" style={{ flex: correct }} /><span className="wrong-segment" style={{ flex: wrong }} /><span className="unanswered-segment" style={{ flex: unanswered }} /></div><dl className="result-stats"><div><dt><i className="stat-dot correct" />Correct answers</dt><dd>{correct}<span>{total ? Math.round(correct / total * 100) : 0}%</span></dd></div><div><dt><i className="stat-dot incorrect" />Incorrect answers</dt><dd>{wrong}<span>{total ? Math.round(wrong / total * 100) : 0}%</span></dd></div><div><dt><i className="stat-dot unanswered" />Left unanswered</dt><dd>{unanswered}<span>{total ? Math.round(unanswered / total * 100) : 0}%</span></dd></div></dl></section>
        <aside className="submission-panel"><div className="panel-heading"><h2>Submission details</h2><Icon name="shield" size={18} /></div><div className="submission-confirmation"><span><Icon name="check" size={23} /></span><div><strong>Assessment submitted</strong><p>Your responses have been saved.</p></div></div><dl className="detail-list"><div><dt>Candidate</dt><dd>{name}</dd></div><div><dt>Status</dt><dd className="text-success">Completed</dd></div><div><dt>Total questions</dt><dd>{total}</dd></div><div><dt>Questions answered</dt><dd>{attempted}</dd></div><div><dt>Questions unanswered</dt><dd>{unanswered}</dd></div></dl><p className="submission-note">You can now close this window.</p></aside>
      </div>
    </>
  )
}
