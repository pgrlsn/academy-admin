import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getOverviewMetrics,
  getRiderProgressList,
  getVideoAnalytics,
  exportRiderProgressCsv,
  formatDate,
  formatDuration,
  type AnalyticsOverview,
  type RiderProgressSummary,
  type VideoAnalytics,
  type AnalyticsFilters,
} from '../../api/analytics';
import { DELIVERY_TYPES } from '../../api/tracks';
import './AnalyticsDashboardPage.css';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'NOT_STARTED', label: 'Not Started' },
];

const AnalyticsDashboardPage = () => {
  const navigate = useNavigate();

  // Overview metrics
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);

  // Video analytics
  const [videoAnalytics, setVideoAnalytics] = useState<VideoAnalytics[]>([]);
  const [videoLoading, setVideoLoading] = useState(true);

  // Rider progress
  const [riders, setRiders] = useState<RiderProgressSummary[]>([]);
  const [riderLoading, setRiderLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  // Filters
  const [filters, setFilters] = useState<AnalyticsFilters>({
    deliveryType: '',
    status: '',
    startDate: '',
    endDate: '',
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'riders' | 'videos'>('overview');
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch overview metrics
  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setOverviewLoading(true);
        const data = await getOverviewMetrics();
        setOverview(data);
      } catch (err) {
        console.error('Failed to fetch overview:', err);
        setError('Failed to load overview metrics.');
      } finally {
        setOverviewLoading(false);
      }
    };
    fetchOverview();
  }, []);

  // Fetch video analytics
  useEffect(() => {
    const fetchVideoAnalytics = async () => {
      try {
        setVideoLoading(true);
        const data = await getVideoAnalytics();
        setVideoAnalytics(data);
      } catch (err) {
        console.error('Failed to fetch video analytics:', err);
      } finally {
        setVideoLoading(false);
      }
    };
    fetchVideoAnalytics();
  }, []);

  // Fetch rider progress
  useEffect(() => {
    const fetchRiders = async () => {
      try {
        setRiderLoading(true);
        const data = await getRiderProgressList({ ...filters, page, pageSize });
        setRiders(data.riders);
        setTotalCount(data.totalCount);
        setTotalPages(data.totalPages);
      } catch (err) {
        console.error('Failed to fetch riders:', err);
      } finally {
        setRiderLoading(false);
      }
    };
    fetchRiders();
  }, [filters, page, pageSize]);

  const handleFilterChange = (key: keyof AnalyticsFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const handleExportCsv = async () => {
    try {
      setExporting(true);
      await exportRiderProgressCsv(filters);
    } catch (err) {
      console.error('Failed to export CSV:', err);
      setError('Failed to export CSV.');
    } finally {
      setExporting(false);
    }
  };

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

  return (
    <div className="analytics-page">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate('/')}>
          &larr; Back to Dashboard
        </button>
        <h1>Training Analytics</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'riders' ? 'active' : ''}`}
          onClick={() => setActiveTab('riders')}
        >
          Rider Progress
        </button>
        <button
          className={`tab-btn ${activeTab === 'videos' ? 'active' : ''}`}
          onClick={() => setActiveTab('videos')}
        >
          Video Analytics
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="tab-content">
          {overviewLoading ? (
            <div className="loading">Loading metrics...</div>
          ) : overview ? (
            <>
              <div className="metrics-grid">
                <div className="metric-card primary">
                  <div className="metric-value">{overview.totalRiders}</div>
                  <div className="metric-label">Total Riders</div>
                </div>
                <div className="metric-card success">
                  <div className="metric-value">{overview.completedTraining}</div>
                  <div className="metric-label">Completed Training</div>
                </div>
                <div className="metric-card warning">
                  <div className="metric-value">{overview.inProgress}</div>
                  <div className="metric-label">In Progress</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value">{overview.completionRate}%</div>
                  <div className="metric-label">Completion Rate</div>
                </div>
              </div>

              <div className="metrics-grid secondary">
                <div className="metric-card small">
                  <div className="metric-value">{overview.avgCompletionDays}</div>
                  <div className="metric-label">Avg Days to Complete</div>
                </div>
                <div className="metric-card small">
                  <div className="metric-value">{overview.avgQuizScore}%</div>
                  <div className="metric-label">Avg Quiz Score</div>
                </div>
                <div className="metric-card small">
                  <div className="metric-value">{overview.totalVideosWatched}</div>
                  <div className="metric-label">Videos Watched</div>
                </div>
                <div className="metric-card small">
                  <div className="metric-value">{overview.totalQuizzesPassed}</div>
                  <div className="metric-label">Quizzes Passed</div>
                </div>
              </div>

              {/* Completion Funnel */}
              <div className="funnel-section">
                <h3>Completion Funnel</h3>
                <div className="funnel">
                  <div className="funnel-item" style={{ width: '100%' }}>
                    <div className="funnel-bar total">
                      <span className="funnel-label">Total Riders</span>
                      <span className="funnel-count">{overview.totalRiders}</span>
                    </div>
                  </div>
                  <div
                    className="funnel-item"
                    style={{ width: `${Math.max(30, overview.totalRiders > 0 ? (overview.inProgress + overview.completedTraining) / overview.totalRiders * 100 : 0)}%` }}
                  >
                    <div className="funnel-bar started">
                      <span className="funnel-label">Started Training</span>
                      <span className="funnel-count">{overview.inProgress + overview.completedTraining}</span>
                    </div>
                  </div>
                  <div
                    className="funnel-item"
                    style={{ width: `${Math.max(30, overview.totalRiders > 0 ? overview.completedTraining / overview.totalRiders * 100 : 0)}%` }}
                  >
                    <div className="funnel-bar completed">
                      <span className="funnel-label">Completed</span>
                      <span className="funnel-count">{overview.completedTraining}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">No data available</div>
          )}
        </div>
      )}

      {/* Rider Progress Tab */}
      {activeTab === 'riders' && (
        <div className="tab-content">
          {/* Filters */}
          <div className="filters-bar">
            <select
              value={filters.deliveryType}
              onChange={(e) => handleFilterChange('deliveryType', e.target.value)}
              className="filter-select"
            >
              <option value="">All Delivery Types</option>
              {DELIVERY_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="filter-select"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="filter-date"
              placeholder="Start Date"
            />

            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="filter-date"
              placeholder="End Date"
            />

            <button
              className="btn-export"
              onClick={handleExportCsv}
              disabled={exporting}
            >
              {exporting ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>

          {/* Results count */}
          <div className="results-info">
            Showing {riders.length} of {totalCount} riders
          </div>

          {/* Rider Table */}
          {riderLoading ? (
            <div className="loading">Loading riders...</div>
          ) : (
            <>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Rider ID</th>
                      <th>Name</th>
                      <th>Status</th>
                      <th>Progress</th>
                      <th>Avg Score</th>
                      <th>Started</th>
                      <th>Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {riders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="empty-row">No riders found</td>
                      </tr>
                    ) : (
                      riders.map((rider) => (
                        <tr key={rider.riderId}>
                          <td>{rider.riderId}</td>
                          <td>{rider.riderName}</td>
                          <td>
                            <span className={`status-badge ${getStatusColor(rider.status)}`}>
                              {rider.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td>
                            <div className="progress-cell">
                              <div className="progress-bar-mini">
                                <div
                                  className="progress-fill-mini"
                                  style={{ width: `${rider.totalVideos > 0 ? (rider.videosCompleted / rider.totalVideos) * 100 : 0}%` }}
                                />
                              </div>
                              <span>{rider.videosCompleted}/{rider.totalVideos}</span>
                            </div>
                          </td>
                          <td>{rider.avgQuizScore !== null ? `${rider.avgQuizScore}%` : '-'}</td>
                          <td>{formatDate(rider.startedAt)}</td>
                          <td>{formatDate(rider.completedAt)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="page-btn"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    Previous
                  </button>
                  <span className="page-info">
                    Page {page + 1} of {totalPages}
                  </span>
                  <button
                    className="page-btn"
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Video Analytics Tab */}
      {activeTab === 'videos' && (
        <div className="tab-content">
          {videoLoading ? (
            <div className="loading">Loading video analytics...</div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Video</th>
                    <th>Duration</th>
                    <th>Views</th>
                    <th>Completions</th>
                    <th>Avg Watch %</th>
                    <th>Quiz Attempts</th>
                    <th>Pass Rate</th>
                    <th>Avg Score</th>
                  </tr>
                </thead>
                <tbody>
                  {videoAnalytics.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="empty-row">No videos found</td>
                    </tr>
                  ) : (
                    videoAnalytics.map((video) => (
                      <tr key={video.videoId}>
                        <td className="video-title-cell">{video.title}</td>
                        <td>{formatDuration(video.durationSeconds)}</td>
                        <td>{video.totalViews}</td>
                        <td>{video.completions}</td>
                        <td>{video.avgWatchPercentage}%</td>
                        <td>{video.quizAttempts}</td>
                        <td>{video.quizPassRate}%</td>
                        <td>{video.avgQuizScore}%</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboardPage;
