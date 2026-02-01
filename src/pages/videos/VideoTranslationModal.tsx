import { useState, useCallback } from 'react';
import {
  SUPPORTED_LANGUAGES,
  getLanguageName,
  uploadTranslationVideo,
  type VideoTranslation,
} from '../../api/translations';
import './VideoTranslationModal.css';

interface VideoTranslationModalProps {
  videoId: number;
  primaryLanguage: string;
  existingLanguages: string[];
  translation?: VideoTranslation;
  onSave: (translation: VideoTranslation) => void;
  onClose: () => void;
}

const VideoTranslationModal: React.FC<VideoTranslationModalProps> = ({
  videoId,
  primaryLanguage,
  existingLanguages,
  translation,
  onSave,
  onClose,
}) => {
  const isEditMode = Boolean(translation?.id);

  const [language, setLanguage] = useState(translation?.language || '');
  const [title, setTitle] = useState(translation?.title || '');
  const [description, setDescription] = useState(translation?.description || '');
  const [videoUrl, setVideoUrl] = useState(translation?.videoUrl || '');
  const [thumbnailUrl, setThumbnailUrl] = useState(translation?.thumbnailUrl || '');

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Filter out primary language and existing translations
  const availableLanguages = SUPPORTED_LANGUAGES.filter(
    (lang) => lang.code !== primaryLanguage && !existingLanguages.includes(lang.code)
  );

  const handleVideoFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!language) {
        setError('Please select a language first');
        return;
      }

      setVideoFile(file);
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);

      try {
        const response = await uploadTranslationVideo(videoId, language, file, (progress) => {
          setUploadProgress(progress);
        });

        setVideoUrl(response.videoUrl);
        if (response.thumbnailUrl) {
          setThumbnailUrl(response.thumbnailUrl);
        }
      } catch (err) {
        console.error('Video upload failed:', err);
        setError('Failed to upload video. Please try again.');
      } finally {
        setIsUploading(false);
      }
    },
    [videoId, language]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!language) {
      setError('Language is required');
      return;
    }
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!videoUrl) {
      setError('Video URL is required. Please upload a video.');
      return;
    }

    setSaving(true);
    setError(null);

    const translationData: VideoTranslation = {
      id: translation?.id,
      language,
      title: title.trim(),
      description: description.trim() || undefined,
      videoUrl,
      thumbnailUrl: thumbnailUrl || undefined,
    };

    try {
      onSave(translationData);
    } catch (err) {
      setError('Failed to save translation');
      setSaving(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="translation-modal-overlay" onClick={handleBackdropClick}>
      <div className="translation-modal">
        <div className="translation-modal-header">
          <h2>{isEditMode ? 'Edit Translation' : 'Add Translation'}</h2>
          <button className="btn-close" onClick={onClose}>
            &times;
          </button>
        </div>

        {error && <div className="translation-error">{error}</div>}

        <form onSubmit={handleSubmit} className="translation-form">
          <div className="form-group">
            <label htmlFor="language">Language *</label>
            {isEditMode ? (
              <input
                type="text"
                value={getLanguageName(language)}
                disabled
                className="language-display"
              />
            ) : (
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={isEditMode}
              >
                <option value="">Select Language</option>
                {availableLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter translated title"
              maxLength={255}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter translated description"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Video File *</label>
            <div className="file-upload-area">
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoFileChange}
                disabled={isUploading || !language}
              />
              {!language && (
                <p className="upload-hint">Select a language first to upload video</p>
              )}
              {isUploading && (
                <div className="upload-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <span>{uploadProgress}%</span>
                </div>
              )}
              {videoFile && !isUploading && (
                <div className="file-info">Selected: {videoFile.name}</div>
              )}
            </div>
            {videoUrl && (
              <div className="current-url">
                <span>URL: </span>
                <a href={videoUrl} target="_blank" rel="noopener noreferrer">
                  {videoUrl.substring(0, 50)}...
                </a>
              </div>
            )}
          </div>

          <div className="translation-modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={saving || isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={saving || isUploading}
            >
              {saving ? 'Saving...' : isEditMode ? 'Update' : 'Add Translation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VideoTranslationModal;
