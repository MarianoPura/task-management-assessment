import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { authApi, getErrorMessage } from '../api/client';
import Alert from '../components/common/Alert';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email.trim());
      setMessage(
        res.message ||
          'If an account associated with this email exists, password reset instructions have been sent.'
      );
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Forgot Password</h1>
          <p className="auth-subtitle">
            Enter your registered email and we'll send you instructions to reset your password.
          </p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {message && <Alert type="info" message={message} />}

        {!message ? (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="forgot-email" className="form-label">
                Email Address
              </label>
              <input
                id="forgot-email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? 'Sending Instructions...' : 'Send Reset Instructions'}
            </button>
          </form>
        ) : (
          <div className="auth-instructions">
            <p className="text-muted text-sm mb-4">
              Please check your email inbox (or backend terminal output during local development) for your secure reset link.
            </p>
          </div>
        )}

        <div className="auth-footer">
          <p>
            Remember your password?{' '}
            <Link to="/login" className="link-primary font-medium">
              Back to log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
