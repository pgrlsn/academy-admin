import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVideos, deleteVideo, bulkUpdateVideoStatus, type Video } from '../../api/videos';
import './VideoListPage.css';

const VideoListPage = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  // Filters
  const [searchTitle, setSearchTitle] = useState('');
  const [filterDeliveryType, setFilterDeliveryType] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<Video | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: Record<string, unknown> = {
        page,
        size: pageSize,
      };

      if (searchTitle) params.title = searchTitle;
      if (filterDeliveryType) params.deliveryType = filterDeliveryType;
      if (filterStatus !== 'all') params.isActive = filterStatus === 'active';

      const response = await getVideos(params);
      setVideos(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (err: unknown) {
      console.error('Failed to fetch videos:', err);
      setError('Failed to load videos. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, searchTitle, filterDeliveryType, filterStatus]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    // Fix #24: Don't call fetchVideos() explicitly — the useEffect will
    // re-run after setPage(0) triggers a re-render with new page value
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(videos.map(v => v.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectVideo = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate') => {
    if (selectedIds.size === 0) return;

    try {
      await bulkUpdateVideoStatus(Array.from(selectedIds), action === 'activate');
      setSelectedIds(new Set());
      fetchVideos();
    } catch (err) {
      console.error('Bulk action failed:', err);
      setError('Failed to update videos. Please try again.');
    }
  };

  const handleDeleteClick = (video: Video) => {
    setVideoToDelete(video);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!videoToDelete) return;

    try {
      setDeleting(true);
      await deleteVideo(videoToDelete.id);
      setDeleteModalOpen(false);
      setVideoToDelete(null);
      fetchVideos();
    } catch (err) {
      console.error('Delete failed:', err);
      setError('Failed to delete video. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="video-list-page">
      <div className="page-header">
        <div>
          <h1>Video Management</h1>
          <p className="subtitle">Manage training videos for rider academy</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/videos/new')}>
          + Add New Video
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search by title..."
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn-search">Search</button>
        </form>

        <div className="filter-group">
          <select
            value={filterDeliveryType}
            onChange={(e) => { setFilterDeliveryType(e.target.value); setPage(0); }}
            className="filter-select"
          >
            <option value="">All Delivery Types</option>
            <option value="AMAZON">Amazon</option>
            <option value="BLUEDART">BlueDart</option>
            <option value="DELHIVERY">Delhivery</option>
            <option value="SWIGGY">Swiggy</option>
            <option value="ZOMATO">Zomato</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value as 'all' | 'active' | 'inactive'); setPage(0); }}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="bulk-actions">
          <span>{selectedIds.size} selected</span>
          <button className="btn-secondary" onClick={() => handleBulkAction('activate')}>
            Activate
          </button>
          <button className="btn-secondary" onClick={() => handleBulkAction('deactivate')}>
            Deactivate
          </button>
        </div>
      )}

      {/* Error */}
      {error && <div className="error-message">{error}</div>}

      {/* Loading */}
      {loading ? (
        <div className="loading">Loading videos...</div>
      ) : (
        <>
          {/* Table */}
          <div className="table-container">
            <table className="videos-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedIds.size === videos.length && videos.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>Thumbnail</th>
                  <th>Title</th>
                  <th>Duration</th>
                  <th>Delivery Types</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {videos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="no-data">No videos found</td>
                  </tr>
                ) : (
                  videos.map((video) => (
                    <tr key={video.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(video.id)}
                          onChange={() => handleSelectVideo(video.id)}
                        />
                      </td>
                      <td>
                        {video.thumbnailUrl ? (
                          <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="video-thumbnail"
                          />
                        ) : (
                          <div className="no-thumbnail">No Image</div>
                        )}
                      </td>
                      <td>
                        <div className="video-title">{video.title}</div>
                        {video.description && (
                          <div className="video-description">{video.description}</div>
                        )}
                      </td>
                      <td>{formatDuration(video.durationSeconds)}</td>
                      <td>
                        <div className="delivery-types">
                          {video.deliveryTypes?.map((type) => (
                            <span key={type} className="delivery-badge">{type}</span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${video.isActive ? 'active' : 'inactive'}`}>
                          {video.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-icon"
                            onClick={() => navigate(`/videos/${video.id}/edit`)}
                            title="Edit"
                          >
                            Edit
                          </button>
                          <button
                            className="btn-icon btn-danger"
                            onClick={() => handleDeleteClick(video)}
                            title="Delete"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination">
            <span>
              Showing {videos.length} of {totalElements} videos
            </span>
            <div className="pagination-controls">
              <button
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
                className="btn-page"
              >
                Previous
              </button>
              <span className="page-info">
                Page {page + 1} of {Math.max(totalPages, 1)}
              </span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
                className="btn-page"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Delete Video</h3>
            <p>Are you sure you want to delete "{videoToDelete?.title}"?</p>
            <p className="modal-note">This will hide the video from riders. You can reactivate it later.</p>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => { setDeleteModalOpen(false); setVideoToDelete(null); }}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="btn-danger"
                onClick={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoListPage;
