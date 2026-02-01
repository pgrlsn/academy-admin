import { useState, useEffect } from 'react';
import { getRiderDetails, formatDate, type RiderDetailedProgress } from '../../api/analytics';
import './RiderDetailModal.css';

interface RiderDetailModalProps {
  riderId: number;
  onClose: () => void;
}

const RiderDetailModal: React.FC<RiderDetailModalProps> = ({ riderId, onClose }) => {
  const [details, setDetails] = useState<RiderDetailedProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getRiderDetails(riderId);
        setDetails(data);
      } catch (err) {
        console.error('Failed to fetch rider details:', err);
        setError('Failed to load rider details.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [riderId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'status-completed';
      case 'IN_PROGRESS':
        return 'status-in-progress';
      default:
        return 'status-not-started';
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="rider-detail-modal">
        <div className="modal-header">
          <h2>Rider Details</h2>
          <button className="btn-close" onClick={onClose}>
            &times;
          </button>
        </div>

        {loading ? (
          <div className="modal-loading">Loading rider details...</div>
        ) : error ? (
          <div className="modal-error">{error}</div>
        ) : details ? (
          <div className="modal-content">
            {/* Rider Info Header */}
            <div className="rider-info-header">
              <div className="rider-info-row">
                <div className="rider-info-item">
                  <span className="info-label">Rider ID</span>
                  <span className="info-value">{details.riderId}</span>
                </div>
                <div className="rider-info-item">
                  <span className="info-label">Name</span>
                  <span className="info-value">{details.riderName}</span>
                </div>
                <div className="rider-info-item">
                  <span className="info-label">Contact</span>
                  <span className="info-value">{details.contactNumber || '-'}</span>
                </div>
              </div>
              <div className="rider-info-row">
                <div className="rider-info-item">
                  <span className="info-label">Delivery Type</span>
                  <span className="info-value">{details.deliveryType || '-'}</span>
                </div>
                <div className="rider-info-item">
                  <span className="info-label">City</span>
                  <span className="info-value">{details.city || '-'}</span>
                </div>
                <div className="rider-info-item">
                  <span className="info-label">Status</span>
                  <span className={`status-badge ${getStatusColor(details.overallStatus)}`}>
                    {details.overallStatus.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <div className="rider-info-row">
                <div className="rider-info-item">
                  <span className="info-label">First Started</span>
                  <span className="info-value">{formatDate(details.firstStarted)}</span>
                </div>
                <div className="rider-info-item">
                  <span className="info-label">Last Activity</span>
                  <span className="info-value">{formatDate(details.lastActivity)}</span>
                </div>
                <div className="rider-info-item">
                  <span className="info-label">Total Quiz Attempts</span>
                  <span className="info-value">{details.totalQuizAttempts}</span>
                </div>
              </div>
            </div>

            {/* Video Progress Table */}
            <div className="video-progress-section">
              <h3>Video Progress</h3>
              <div className="table-container">
                <table className="video-progress-table">
                  <thead>
                    <tr>
                      <th>Video</th>
                      <th>Status</th>
                      <th>Watched</th>
                      <th>Language</th>
                      <th>Quiz Attempts</th>
                      <th>Quiz Score</th>
                      <th>Started</th>
                      <th>Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.videoProgress.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="empty-row">No video progress found</td>
                      </tr>
                    ) : (
                      details.videoProgress.map((video) => (
                        <tr key={video.videoId}>
                          <td className="video-title-cell">{video.videoTitle}</td>
                          <td>
                            <span className={`status-badge small ${getStatusColor(video.status)}`}>
                              {video.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td>
                            <div className="progress-cell">
                              <div className="progress-bar-mini">
                                <div
                                  className="progress-fill-mini"
                                  style={{ width: `${video.watchedPercentage}%` }}
                                />
                              </div>
                              <span>{video.watchedPercentage}%</span>
                            </div>
                          </td>
                          <td>{video.language || 'en'}</td>
                          <td>{video.quizAttempts}</td>
                          <td>
                            {video.quizScore !== null ? (
                              <span className={video.quizPassed ? 'score-passed' : 'score-failed'}>
                                {video.quizScore}%
                              </span>
                            ) : '-'}
                          </td>
                          <td>{formatDate(video.startedAt)}</td>
                          <td>{formatDate(video.completedAt)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="summary-stats">
              <div className="stat-item">
                <span className="stat-value">
                  {details.videoProgress.filter(v => v.status === 'COMPLETED').length}/{details.videoProgress.length}
                </span>
                <span className="stat-label">Videos Completed</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">
                  {details.avgQuizScore !== null ? `${details.avgQuizScore}%` : '-'}
                </span>
                <span className="stat-label">Avg Quiz Score</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{details.totalQuizAttempts}</span>
                <span className="stat-label">Total Quiz Attempts</span>
              </div>
            </div>
          </div>
        ) : null}

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RiderDetailModal;
