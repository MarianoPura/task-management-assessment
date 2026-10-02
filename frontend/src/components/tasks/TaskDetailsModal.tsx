import type { Task } from '../../types';
import Modal from '../common/Modal';
import Badge from '../common/Badge';

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onEdit?: (task: Task) => void;
}

export default function TaskDetailsModal({
  isOpen,
  onClose,
  task,
  onEdit,
}: TaskDetailsModalProps) {
  if (!task) return null;

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Not set';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString?: string | null) => {
    if (!dateString) return 'Not set';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const isOverdue =
    task.dueDate &&
    task.status.name !== 'Completed' &&
    new Date(task.dueDate) < new Date();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Task Details" maxWidth="560px">
      <div className="task-details-content">
        <div className="task-details-header">
          <h2 className="task-details-title">{task.title}</h2>
          <div className="task-details-badges">
            <Badge type="status" label={task.status.name} />
            <Badge type="priority" label={task.priority.name} />
            {isOverdue && <span className="overdue-tag">Overdue</span>}
          </div>
        </div>

        <div className="task-details-section">
          <label className="task-details-label">Description</label>
          <div className="task-details-description">
            {task.description ? (
              <p>{task.description}</p>
            ) : (
              <p className="text-muted italic">No description provided.</p>
            )}
          </div>
        </div>

        <div className="task-details-meta-grid">
          <div className="task-details-meta-item">
            <span className="task-details-label">Due Date</span>
            <span className={`task-details-value ${isOverdue ? 'text-danger font-medium' : ''}`}>
              {formatDate(task.dueDate)}
            </span>
          </div>

          <div className="task-details-meta-item">
            <span className="task-details-label">Created At</span>
            <span className="task-details-value">{formatDateTime(task.createdAt)}</span>
          </div>

          <div className="task-details-meta-item">
            <span className="task-details-label">Last Updated</span>
            <span className="task-details-value">{formatDateTime(task.updatedAt)}</span>
          </div>
        </div>

        <div className="modal-actions">
          {onEdit && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                onClose();
                onEdit(task);
              }}
            >
              Edit Task
            </button>
          )}
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
