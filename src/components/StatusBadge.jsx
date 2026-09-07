const LABELS = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected', paid: 'Paid', failed: 'Failed', paused: 'Paused', active: 'Active', expired: 'Expired', success: 'Success', new: 'New', read: 'Read', replied: 'Replied', resolved: 'Resolved', dismissed: 'Dismissed', suspended: 'Suspended' };
export default function StatusBadge({ status }) {
  const cls = { pending: 'pending', new: 'pending', approved: 'approved', active: 'approved', paid: 'approved', success: 'approved', resolved: 'approved', replied: 'approved', rejected: 'rejected', failed: 'rejected', suspended: 'rejected', dismissed: 'sold', paused: 'sold', expired: 'sold', read: 'sold' }[status] || 'pending';
  return <span className={`shx-badge shx-badge--${cls}`}>{LABELS[status] || status}</span>;
}
