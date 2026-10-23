import Icon from './Icon'

export default function CameraPreview({ videoRef, cameraEnabled }) {
  return (
    <section className="camera-panel" aria-labelledby="camera-preview-title">
      <div className="camera-panel-heading"><h2 id="camera-preview-title">Camera preview</h2><span className="connection-status"><i className={`status-dot ${cameraEnabled ? 'online' : ''}`} />{cameraEnabled ? 'Connected' : 'Offline'}</span></div>
      <div className={`camera-preview ${cameraEnabled ? 'connected' : ''}`}>
        <video ref={videoRef} autoPlay playsInline muted aria-label="Your camera preview" />
        {!cameraEnabled && <div className="camera-placeholder"><span className="camera-illustration"><Icon name="camera" size={28} /></span><strong>No camera connected</strong><p>Connect your camera to see a preview.</p></div>}
        <div className="preview-corners" aria-hidden="true"><i /><i /><i /><i /></div>
        {cameraEnabled && <span className="preview-label"><Icon name="camera" size={12} />LIVE PREVIEW</span>}
      </div>
    </section>
  )
}
