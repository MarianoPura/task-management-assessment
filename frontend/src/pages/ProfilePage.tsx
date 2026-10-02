import { useState, useEffect, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileApi, getErrorMessage } from '../api/client';
import Navbar from '../components/common/Navbar';
import Alert from '../components/common/Alert';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load fresh profile data on mount
  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        const profile = await profileApi.getProfile();
        setFirstName(profile.firstName);
        setLastName(profile.lastName);
        setUsername(profile.username);
        setEmail(profile.email);
        updateUser(profile);
      } catch (err: unknown) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!firstName.trim() || !lastName.trim() || !username.trim() || !email.trim()) {
      setError('All fields are required.');
      return;
    }

    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }

    setSaving(true);
    try {
      const updated = await profileApi.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim(),
        email: email.trim(),
      });

      updateUser(updated);
      setSuccess('Your profile has been updated successfully!');
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="main-content">
        <div className="content-container profile-container">
          <div className="page-header">
            <div>
              <h1 className="page-heading">User Profile</h1>
              <p className="page-subheading">
                View and manage your personal account settings.
              </p>
            </div>
          </div>

          {error && <Alert type="error" message={error} onClose={() => setError('')} />}
          {success && (
            <Alert type="success" message={success} onClose={() => setSuccess('')} />
          )}

          {loading ? (
            <div className="center-page py-12">
              <LoadingSpinner text="Loading profile..." />
            </div>
          ) : (
            <div className="profile-grid">
              {/* Account Overview Card */}
              <div className="profile-overview-card">
                <div className="profile-avatar">
                  {firstName.charAt(0).toUpperCase()}
                  {lastName.charAt(0).toUpperCase()}
                </div>
                <h3 className="profile-fullname">
                  {firstName} {lastName}
                </h3>
                <p className="profile-handle">@{username}</p>
                <div className="profile-meta-info">
                  <div className="profile-meta-row">
                    <span className="profile-meta-label">Email:</span>
                    <span className="profile-meta-val">{email}</span>
                  </div>
                  <div className="profile-meta-row">
                    <span className="profile-meta-label">Member Since:</span>
                    <span className="profile-meta-val">{formatDate(user?.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Edit Profile Form Card */}
              <div className="profile-form-card">
                <h3 className="card-heading">Edit Profile Information</h3>
                <p className="card-subheading">
                  Update your name, username, and email address.
                </p>

                <form onSubmit={handleSubmit} className="profile-form">
                  <div className="form-row">
                    <div className="form-group flex-1">
                      <label htmlFor="profile-firstName" className="form-label">
                        First Name <span className="text-danger">*</span>
                      </label>
                      <input
                        id="profile-firstName"
                        type="text"
                        className="form-input"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        disabled={saving}
                      />
                    </div>

                    <div className="form-group flex-1">
                      <label htmlFor="profile-lastName" className="form-label">
                        Last Name <span className="text-danger">*</span>
                      </label>
                      <input
                        id="profile-lastName"
                        type="text"
                        className="form-input"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        disabled={saving}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="profile-username" className="form-label">
                      Username <span className="text-danger">*</span>
                    </label>
                    <input
                      id="profile-username"
                      type="text"
                      className="form-input"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      disabled={saving}
                    />
                    <span className="form-hint">
                      Changing your username requires it to be unique.
                    </span>
                  </div>

                  <div className="form-group">
                    <label htmlFor="profile-email" className="form-label">
                      Email Address <span className="text-danger">*</span>
                    </label>
                    <input
                      id="profile-email"
                      type="email"
                      className="form-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={saving}
                    />
                    <span className="form-hint">
                      Changing your email requires it to be unique.
                    </span>
                  </div>

                  <div className="form-actions">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={saving}
                    >
                      {saving ? 'Saving Changes...' : 'Save Profile Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
