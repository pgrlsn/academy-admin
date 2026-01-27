import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  createVideo,
  updateVideo,
  getVideoById,
  uploadVideo,
  uploadThumbnail,
  type VideoCreateRequest,
} from '../../api/videos';
import { DELIVERY_TYPES } from '../../api/tracks';
import './VideoFormPage.css';

const VideoFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [sequenceOrder, setSequenceOrder] = useState(1);
  const [isMandatory, setIsMandatory] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [deliveryTypes, setDeliveryTypes] = useState<string[]>([]);

  // Upload state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  const [, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailUploadProgress, setThumbnailUploadProgress] = useState(0);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);

  // Page state
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch video data for edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const fetchVideo = async () => {
        try {
          setLoading(true);
          const video = await getVideoById(parseInt(id, 10));
          setTitle(video.title);
          setDescription(video.description || '');
          setDurationSeconds(video.durationSeconds);
          setVideoUrl(video.videoUrl);
          setThumbnailUrl(video.thumbnailUrl || '');
          setSequenceOrder(video.sequenceOrder);
          setIsMandatory(video.isMandatory);
          setIsActive(video.isActive);
          setDeliveryTypes(video.deliveryTypes || []);
        } catch (err) {
          console.error('Failed to fetch video:', err);
          setError('Failed to load video. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      fetchVideo();
    }
  }, [isEditMode, id]);

  const handleVideoFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoFile(file);
    setIsUploadingVideo(true);
    setVideoUploadProgress(0);
    setError(null);

    try {
      const response = await uploadVideo(file, (progress) => {
        setVideoUploadProgress(progress);
      });

      setVideoUrl(response.videoUrl);
      if (response.durationSeconds) {
        setDurationSeconds(response.durationSeconds);
      }
      if (response.thumbnailUrl && !thumbnailUrl) {
        setThumbnailUrl(response.thumbnailUrl);
      }
    } catch (err) {
      console.error('Video upload failed:', err);
      setError('Failed to upload video. Please try again.');
    } finally {
      setIsUploadingVideo(false);
    }
  }, [thumbnailUrl]);

  const handleThumbnailFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setThumbnailFile(file);
    setIsUploadingThumbnail(true);
    setThumbnailUploadProgress(0);
    setError(null);

    try {
      const response = await uploadThumbnail(file, (progress) => {
        setThumbnailUploadProgress(progress);
      });

      setThumbnailUrl(response.thumbnailUrl);
    } catch (err) {
      console.error('Thumbnail upload failed:', err);
      setError('Failed to upload thumbnail. Please try again.');
    } finally {
      setIsUploadingThumbnail(false);
    }
  }, []);

  const handleDeliveryTypeChange = (type: string) => {
    setDeliveryTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!videoUrl) {
      setError('Video URL is required. Please upload a video.');
      return;
    }
    if (deliveryTypes.length === 0) {
      setError('At least one delivery type must be selected');
      return;
    }

    setSaving(true);
    setError(null);

    const videoData: VideoCreateRequest = {
      title: title.trim(),
      description: description.trim() || undefined,
      durationSeconds,
      videoUrl,
      thumbnailUrl: thumbnailUrl || undefined,
      sequenceOrder,
      isMandatory,
      isActive,
      deliveryTypes,
    };

    try {
      if (isEditMode && id) {
        await updateVideo(parseInt(id, 10), { ...videoData, id: parseInt(id, 10) });
      } else {
        await createVideo(videoData);
      }
      navigate('/videos');
    } catch (err) {
      console.error('Save failed:', err);
      setError('Failed to save video. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="video-form-page">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="video-form-page">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate('/videos')}>
          &larr; Back to Videos
        </button>
        <h1>{isEditMode ? 'Edit Video' : 'Add New Video'}</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="video-form">
        <div className="form-section">
          <h2>Basic Information</h2>

          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title"
              maxLength={255}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter video description"
              rows={4}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="sequenceOrder">Sequence Order</label>
              <input
                type="number"
                id="sequenceOrder"
                value={sequenceOrder}
                onChange={(e) => setSequenceOrder(parseInt(e.target.value, 10) || 1)}
                min={1}
              />
            </div>

            <div className="form-group">
              <label htmlFor="duration">Duration (seconds)</label>
              <input
                type="number"
                id="duration"
                value={durationSeconds}
                onChange={(e) => setDurationSeconds(parseInt(e.target.value, 10) || 0)}
                min={0}
                placeholder="Auto-detected from video"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Video File</h2>

          <div className="form-group">
            <label>Upload Video *</label>
            <div className="file-upload-area">
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoFileChange}
                disabled={isUploadingVideo}
              />
              {isUploadingVideo && (
                <div className="upload-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${videoUploadProgress}%` }}
                    />
                  </div>
                  <span>{videoUploadProgress}%</span>
                </div>
              )}
              {videoFile && !isUploadingVideo && (
                <div className="file-info">Selected: {videoFile.name}</div>
              )}
            </div>
            {videoUrl && (
              <div className="current-url">
                <span>Current: </span>
                <a href={videoUrl} target="_blank" rel="noopener noreferrer">
                  {videoUrl.substring(0, 50)}...
                </a>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Upload Thumbnail</label>
            <div className="file-upload-area">
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailFileChange}
                disabled={isUploadingThumbnail}
              />
              {isUploadingThumbnail && (
                <div className="upload-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${thumbnailUploadProgress}%` }}
                    />
                  </div>
                  <span>{thumbnailUploadProgress}%</span>
                </div>
              )}
            </div>
            {thumbnailUrl && (
              <div className="thumbnail-preview">
                <img src={thumbnailUrl} alt="Thumbnail preview" />
              </div>
            )}
          </div>
        </div>

        <div className="form-section">
          <h2>Delivery Types *</h2>
          <p className="section-hint">Select which delivery types this video applies to</p>

          <div className="checkbox-grid">
            {DELIVERY_TYPES.map((type) => (
              <label key={type.value} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={deliveryTypes.includes(type.value)}
                  onChange={() => handleDeliveryTypeChange(type.value)}
                />
                <span>{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h2>Settings</h2>

          <div className="toggle-group">
            <label className="toggle-item">
              <input
                type="checkbox"
                checked={isMandatory}
                onChange={(e) => setIsMandatory(e.target.checked)}
              />
              <span className="toggle-label">
                <strong>Mandatory Video</strong>
                <small>Riders must complete this video to start accepting orders</small>
              </span>
            </label>

            <label className="toggle-item">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <span className="toggle-label">
                <strong>Active</strong>
                <small>Video is visible to riders</small>
              </span>
            </label>
          </div>
        </div>

        {isEditMode && id && (
          <div className="form-section quiz-section">
            <h2>Quiz Questions</h2>
            <p className="section-hint">Add quiz questions that riders must answer after watching</p>
            <button
              type="button"
              className="btn-quiz"
              onClick={() => navigate(`/videos/${id}/quiz`)}
            >
              Manage Quiz Questions &rarr;
            </button>
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/videos')}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={saving || isUploadingVideo || isUploadingThumbnail}
          >
            {saving ? 'Saving...' : isEditMode ? 'Update Video' : 'Create Video'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VideoFormPage;
