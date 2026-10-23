import Icon from './Icon'

export default function MetricCard({ label, value, detail, icon, complete = false }) {
  return (
    <section className={`metric-card ${complete ? 'metric-complete' : ''}`} aria-label={label}>
      <div className="metric-top"><span>{label}</span><Icon name={icon} size={18} /></div>
      <strong className="metric-value">{value}</strong>
      <span className="metric-detail">{complete && <Icon name="check" size={13} />}{detail}</span>
    </section>
  )
}
