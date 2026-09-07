export default function ConfirmDialog({ title, description, confirmLabel = 'Confirm', danger, onConfirm, onCancel, busy }) {
  return (
    <div className="shx-modal-overlay" onClick={onCancel}>
      <div className="shx-modal" style={{ maxWidth: 380 }} onClick={(e) => e.stopPropagation()}>
        <p style={{ fontWeight: 800, fontSize: 15 }}>{title}</p>
        {description && <p className="shx-muted shx-text-sm shx-mt-8">{description}</p>}
        <div className="shx-flex shx-gap-8 shx-mt-24">
          <button className="shx-btn shx-btn--outline" onClick={onCancel} disabled={busy}>Cancel</button>
          <button className={`shx-btn ${danger ? 'shx-btn--danger' : 'shx-btn--primary'}`} onClick={onConfirm} disabled={busy}>
            {busy ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
