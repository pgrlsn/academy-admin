import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAllTracks,
  DELIVERY_TYPES,
  type MandatoryTrack,
} from '../../api/tracks';
import './MandatoryTracksPage.css';

const MandatoryTracksPage = () => {
  const navigate = useNavigate();
  const [tracks, setTracks] = useState<MandatoryTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        setLoading(true);
        const data = await getAllTracks();
        setTracks(data);
      } catch (err) {
        console.error('Failed to fetch tracks:', err);
        setError('Failed to load mandatory tracks.');
      } finally {
        setLoading(false);
      }
    };
    fetchTracks();
  }, []);

  const getTrackForDeliveryType = (deliveryType: string): MandatoryTrack | undefined => {
    return tracks.find((t) => t.deliveryType === deliveryType);
  };

  const handleEditTrack = (deliveryType: string) => {
    navigate(`/tracks/${deliveryType}`);
  };

  if (loading) {
    return (
      <div className="tracks-page">
        <div className="loading">Loading mandatory tracks...</div>
      </div>
    );
  }

  return (
    <div className="tracks-page">
      <div className="page-header">
        <h1>Mandatory Training Tracks</h1>
        <p className="page-description">
          Configure which videos are mandatory for each delivery type and their order.
          Riders must complete all mandatory videos before they can start accepting orders.
        </p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="tracks-grid">
        {DELIVERY_TYPES.map((type) => {
          const track = getTrackForDeliveryType(type.value);
          const videoCount = track?.videos?.length || 0;
          const isConfigured = track && track.isActive && videoCount > 0;

          return (
            <div
              key={type.value}
              className={`track-card ${isConfigured ? 'configured' : 'not-configured'}`}
            >
              <div className="track-header">
                <h2>{type.label}</h2>
                <span className={`status-badge ${isConfigured ? 'active' : 'inactive'}`}>
                  {isConfigured ? 'Configured' : 'Not Configured'}
                </span>
              </div>

              <div className="track-body">
                {isConfigured ? (
                  <>
                    <div className="video-count">
                      <span className="count">{videoCount}</span>
                      <span className="label">Mandatory Videos</span>
                    </div>
                    <div className="video-list">
                      {track.videos.slice(0, 3).map((video, index) => (
                        <div key={video.id} className="video-item">
                          <span className="video-order">{index + 1}.</span>
                          <span className="video-title">{video.title}</span>
                        </div>
                      ))}
                      {videoCount > 3 && (
                        <div className="more-videos">
                          +{videoCount - 3} more videos
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="empty-state">
                    <p>No mandatory videos configured.</p>
                    <p className="hint">Click "Configure" to add videos to this track.</p>
                  </div>
                )}
              </div>

              <div className="track-footer">
                <button
                  className="btn-configure"
                  onClick={() => handleEditTrack(type.value)}
                >
                  {isConfigured ? 'Edit Track' : 'Configure'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MandatoryTracksPage;
