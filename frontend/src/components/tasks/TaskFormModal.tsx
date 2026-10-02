import { useState, useEffect, type FormEvent } from 'react';
import type { Task, TaskStatus, TaskPriority, CreateTaskPayload } from '../../types';
import Modal from '../common/Modal';
import Alert from '../common/Alert';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskPayload) => Promise<void>;
  task?: Task | null; // If provided, we are in Edit mode; otherwise, Create mode
  statuses: TaskStatus[];
  priorities: TaskPriority[];
}

export default function TaskFormModal({
  isOpen,
  onClose,
  onSubmit,
  task,
  statuses,
  priorities,
}: TaskFormModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [statusId, setStatusId] = useState<number>(0);
  const [priorityId, setPriorityId] = useState<number>(0);
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize or reset form state when modal opens or task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatusId(task.statusId);
      setPriorityId(task.priorityId);
      setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
    } else {
      setTitle('');
      setDescription('');
      setStatusId(statuses[0]?.id || 1);
      setPriorityId(priorities[0]?.id || 1);
      setDueDate('');
    }
    setError('');
  }, [task, statuses, priorities, isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    if (!statusId) {
      setError('Please select a valid status');
      return;
    }

    if (!priorityId) {
      setError('Please select a valid priority');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() ? description.trim() : null,
        statusId: Number(statusId),
        priorityId: Number(priorityId),
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditMode = Boolean(task);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Task' : 'Create New Task'}
      maxWidth="540px"
    >
      <form onSubmit={handleSubmit} className="task-form">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        <div className="form-group">
          <label htmlFor="task-title" className="form-label">
            Title <span className="text-danger">*</span>
          </label>
          <input
            id="task-title"
            type="text"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Update user documentation"
            disabled={isSubmitting}
            required
            autoFocus
          />
        </div>

        <div className="form-group">
          <label htmlFor="task-description" className="form-label">
            Description
          </label>
          <textarea
            id="task-description"
            className="form-textarea"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add extra details or notes (optional)"
            disabled={isSubmitting}
          />
        </div>

        <div className="form-row">
          <div className="form-group flex-1">
            <label htmlFor="task-status" className="form-label">
              Status <span className="text-danger">*</span>
            </label>
            <select
              id="task-status"
              className="form-select"
              value={statusId}
              onChange={(e) => setStatusId(Number(e.target.value))}
              disabled={isSubmitting}
              required
            >
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group flex-1">
            <label htmlFor="task-priority" className="form-label">
              Priority <span className="text-danger">*</span>
            </label>
            <select
              id="task-priority"
              className="form-select"
              value={priorityId}
              onChange={(e) => setPriorityId(Number(e.target.value))}
              disabled={isSubmitting}
              required
            >
              {priorities.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="task-duedate" className="form-label">
            Due Date
          </label>
          <input
            id="task-duedate"
            type="date"
            className="form-input"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting
              ? isEditMode
                ? 'Updating...'
                : 'Creating...'
              : isEditMode
              ? 'Update Task'
              : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
