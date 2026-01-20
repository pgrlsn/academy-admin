import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getTrackByDeliveryType,
  getAvailableVideos,
  saveTrack,
  copyTrack,
  DELIVERY_TYPES,
  formatDuration,
  type VideoSummary,
  type MandatoryTrack,
} from '../../api/tracks';
import './TrackEditorPage.css';

const TrackEditorPage = () => {
  const navigate = useNavigate();
  const { deliveryType } = useParams<{ deliveryType: string }>();

  const [track, setTrack] = useState<MandatoryTrack | null>(null);
  const [availableVideos, setAvailableVideos] = useState<VideoSummary[]>([]);
  const [mandatoryVideos, setMandatoryVideos] = useState<VideoSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [copyFromType, setCopyFromType] = useState<string>('');
  const [showCopyModal, setShowCopyModal] = useState(false);

  const deliveryTypeLabel = DELIVERY_TYPES.find((t) => t.value === deliveryType)?.label || deliveryType;

  useEffect(() => {
    const fetchData = async () => {
      if (!deliveryType) return;

      try {
        setLoading(true);
        setError(null);

        const [trackData, videosData] = await Promise.all([
          getTrackByDeliveryType(deliveryType),
          getAvailableVideos(deliveryType),
        ]);

        setTrack(trackData);
        setAvailableVideos(videosData);

        if (trackData && trackData.videos) {
          setMandatoryVideos(trackData.videos);
        }
      } catch (err) {
        console.error('Failed to fetch track data:', err);
        setError('Failed to load track data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [deliveryType]);

  // Filter out videos that are already in the mandatory list
  const getAvailableForSelection = useCallback(() => {
    const mandatoryIds = new Set(mandatoryVideos.map((v) => v.id));
    return availableVideos.filter((v) => !mandatoryIds.has(v.id));
  }, [availableVideos, mandatoryVideos]);

  const handleAddVideo = (video: VideoSummary) => {
    setMandatoryVideos((prev) => [...prev, video]);
    setIsDirty(true);
  };

  const handleRemoveVideo = (videoId: number) => {
    setMandatoryVideos((prev) => prev.filter((v) => v.id !== videoId));
    setIsDirty(true);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setMandatoryVideos((prev) => {
      const newList = [...prev];
      [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
      return newList;
    });
    setIsDirty(true);
  };

  const handleMoveDown = (index: number) => {
    if (index === mandatoryVideos.length - 1) return;
    setMandatoryVideos((prev) => {
      const newList = [...prev];
      [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
      return newList;
    });
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!deliveryType) return;

    try {
      setSaving(true);
      setError(null);

      const videoIds = mandatoryVideos.map((v) => v.id);
      await saveTrack({
        deliveryType,
        videoIds,
        isActive: true,
      });

      setIsDirty(false);
      navigate('/tracks');
    } catch (err) {
      console.error('Failed to save track:', err);
      setError('Failed to save track. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyFrom = async () => {
    if (!deliveryType || !copyFromType) return;

    try {
      setSaving(true);
      setError(null);

      const copiedTrack = await copyTrack(copyFromType, deliveryType);
      setMandatoryVideos(copiedTrack.videos || []);
      setTrack(copiedTrack);
      setIsDirty(false);
      setShowCopyModal(false);
      setCopyFromType('');
    } catch (err) {
      console.error('Failed to copy track:', err);
      setError('Failed to copy track. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/tracks');
      }
    } else {
      navigate('/tracks');
    }
  };

  if (loading) {
    return (
      <div className="track-editor-page">
        <div className="loading">Loading track configuration...</div>
      </div>
    );
  }

  const availableForSelection = getAvailableForSelection();

  return (
    <div className="track-editor-page">
      <div className="page-header">
        <button className="btn-back" onClick={handleBack}>
          &larr; Back to Tracks
        </button>
        <div className="header-content">
          <h1>Configure {deliveryTypeLabel} Track</h1>
          {isDirty && <span className="unsaved-badge">Unsaved changes</span>}
        </div>
        <div className="header-actions">
          <button
            className="btn-secondary"
            onClick={() => setShowCopyModal(true)}
          >
            Copy from...
          </button>
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={saving || !isDirty}
          >
            {saving ? 'Saving...' : 'Save Track'}
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="editor-layout">
        {/* Available Videos Panel */}
        <div className="panel available-panel">
          <div className="panel-header">
            <h2>Available Videos</h2>
            <span className="count">{availableForSelection.length} videos</span>
          </div>
          <div className="panel-body">
            {availableForSelection.length === 0 ? (
              <div className="empty-panel">
                <p>No more videos available.</p>
                <p className="hint">All videos tagged with "{deliveryTypeLabel}" have been added to the track.</p>
              </div>
            ) : (
              <div className="video-list">
                {availableForSelection.map((video) => (
                  <div key={video.id} className="video-card available">
                    <div className="video-thumbnail">
                      {video.thumbnailUrl ? (
                        <img src={video.thumbnailUrl} alt={video.title} />
                      ) : (
                        <div className="no-thumbnail">No Thumbnail</div>
                      )}
                    </div>
                    <div className="video-info">
                      <h3>{video.title}</h3>
                      <span className="duration">{formatDuration(video.durationSeconds)}</span>
                    </div>
                    <button
                      className="btn-add"
                      onClick={() => handleAddVideo(video)}
                      title="Add to mandatory track"
                    >
                      +
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mandatory Track Panel */}
        <div className="panel mandatory-panel">
          <div className="panel-header">
            <h2>Mandatory Sequence</h2>
            <span className="count">{mandatoryVideos.length} videos</span>
          </div>
          <div className="panel-body">
            {mandatoryVideos.length === 0 ? (
              <div className="empty-panel">
                <p>No mandatory videos yet.</p>
                <p className="hint">Add videos from the left panel to create the mandatory training sequence.</p>
              </div>
            ) : (
              <div className="video-list mandatory-list">
                {mandatoryVideos.map((video, index) => (
                  <div key={video.id} className="video-card mandatory">
                    <div className="video-order">{index + 1}</div>
                    <div className="video-thumbnail">
                      {video.thumbnailUrl ? (
                        <img src={video.thumbnailUrl} alt={video.title} />
                      ) : (
                        <div className="no-thumbnail">No Thumbnail</div>
                      )}
                    </div>
                    <div className="video-info">
                      <h3>{video.title}</h3>
                      <span className="duration">{formatDuration(video.durationSeconds)}</span>
                    </div>
                    <div className="video-actions">
                      <button
                        className="btn-move"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        className="btn-move"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === mandatoryVideos.length - 1}
                        title="Move down"
                      >
                        ↓
                      </button>
                      <button
                        className="btn-remove"
                        onClick={() => handleRemoveVideo(video.id)}
                        title="Remove from track"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Copy From Modal */}
      {showCopyModal && (
        <div className="modal-overlay" onClick={() => setShowCopyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Copy Track Configuration</h2>
            <p>Select a delivery type to copy its track configuration to {deliveryTypeLabel}.</p>
            <p className="warning">This will replace the current mandatory video sequence.</p>

            <select
              value={copyFromType}
              onChange={(e) => setCopyFromType(e.target.value)}
              className="copy-select"
            >
              <option value="">Select a delivery type...</option>
              {DELIVERY_TYPES.filter((t) => t.value !== deliveryType).map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowCopyModal(false);
                  setCopyFromType('');
                }}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleCopyFrom}
                disabled={!copyFromType || saving}
              >
                {saving ? 'Copying...' : 'Copy Track'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackEditorPage;
