import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="center-page py-16">
      <div className="not-found-card">
        <h1 className="not-found-code">404</h1>
        <h2 className="not-found-title">Page Not Found</h2>
        <p className="not-found-text">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link to="/dashboard" className="btn btn-primary mt-6">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
