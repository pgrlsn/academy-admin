import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getVideoById, type Video } from '../../api/videos';
import {
  getQuizQuestions,
  saveQuizQuestions,
  deleteQuizQuestion,
  type QuizQuestion,
} from '../../api/quiz';
import './QuizBuilderPage.css';

interface LocalQuestion {
  id?: number;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  sequenceOrder: number;
  isEditing: boolean;
  isDraft: boolean;
}

const QuizBuilderPage = () => {
  const navigate = useNavigate();
  const { videoId } = useParams<{ videoId: string }>();

  const [video, setVideo] = useState<Video | null>(null);
  const [questions, setQuestions] = useState<LocalQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<number | null>(null);

  // Fetch video and questions
  useEffect(() => {
    const fetchData = async () => {
      if (!videoId) return;

      try {
        setLoading(true);
        const [videoData, questionsData] = await Promise.all([
          getVideoById(parseInt(videoId, 10)),
          getQuizQuestions(parseInt(videoId, 10)),
        ]);

        setVideo(videoData);
        setQuestions(
          questionsData.map((q) => ({
            id: q.id,
            questionText: q.questionText,
            options: q.options,
            correctOptionIndex: q.correctOptionIndex,
            sequenceOrder: q.sequenceOrder,
            isEditing: false,
            isDraft: false,
          }))
        );
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load quiz data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [videoId]);

  const handleAddQuestion = () => {
    const newQuestion: LocalQuestion = {
      questionText: '',
      options: ['', '', '', ''],
      correctOptionIndex: 0,
      sequenceOrder: questions.length + 1,
      isEditing: true,
      isDraft: true,
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleUpdateQuestion = (index: number, field: keyof LocalQuestion, value: unknown) => {
    const updated = [...questions];
    (updated[index] as Record<string, unknown>)[field] = value;
    updated[index].isDraft = true;
    setQuestions(updated);
  };

  const handleUpdateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    updated[questionIndex].isDraft = true;
    setQuestions(updated);
  };

  const handleToggleEditing = (index: number) => {
    const updated = [...questions];
    updated[index].isEditing = !updated[index].isEditing;
    setQuestions(updated);
  };

  const handleDeleteClick = (index: number) => {
    setQuestionToDelete(index);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (questionToDelete === null) return;

    const question = questions[questionToDelete];

    try {
      if (question.id) {
        await deleteQuizQuestion(question.id);
      }

      const updated = questions.filter((_, i) => i !== questionToDelete);
      // Reorder remaining questions
      updated.forEach((q, i) => {
        q.sequenceOrder = i + 1;
      });
      setQuestions(updated);
    } catch (err) {
      console.error('Delete failed:', err);
      setError('Failed to delete question. Please try again.');
    } finally {
      setDeleteModalOpen(false);
      setQuestionToDelete(null);
    }
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === questions.length - 1)
    ) {
      return;
    }

    const updated = [...questions];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];

    // Update sequence orders
    updated.forEach((q, i) => {
      q.sequenceOrder = i + 1;
      q.isDraft = true;
    });

    setQuestions(updated);
  };

  const validateQuestions = (): string | null => {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];

      if (!q.questionText.trim()) {
        return `Question ${i + 1}: Question text is required`;
      }

      const filledOptions = q.options.filter((opt) => opt.trim());
      if (filledOptions.length < 2) {
        return `Question ${i + 1}: At least 2 options are required`;
      }

      if (q.correctOptionIndex >= filledOptions.length || !q.options[q.correctOptionIndex]?.trim()) {
        return `Question ${i + 1}: Correct answer must be selected from filled options`;
      }
    }

    return null;
  };

  const handleSave = async () => {
    const validationError = validateQuestions();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!videoId) return;

    try {
      setSaving(true);
      setError(null);

      const questionsToSave = questions.map((q) => ({
        questionText: q.questionText.trim(),
        options: q.options.filter((opt) => opt.trim()),
        correctOptionIndex: q.correctOptionIndex,
        sequenceOrder: q.sequenceOrder,
      }));

      const savedQuestions = await saveQuizQuestions(parseInt(videoId, 10), questionsToSave);

      // Update local state with saved data
      setQuestions(
        savedQuestions.map((q) => ({
          id: q.id,
          questionText: q.questionText,
          options: q.options,
          correctOptionIndex: q.correctOptionIndex,
          sequenceOrder: q.sequenceOrder,
          isEditing: false,
          isDraft: false,
        }))
      );
    } catch (err) {
      console.error('Save failed:', err);
      setError('Failed to save questions. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const hasDrafts = questions.some((q) => q.isDraft);

  if (loading) {
    return (
      <div className="quiz-builder-page">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="quiz-builder-page">
      <div className="page-header">
        <div className="header-left">
          <button className="btn-back" onClick={() => navigate(`/videos/${videoId}/edit`)}>
            &larr; Back to Video
          </button>
          <h1>Quiz Builder</h1>
          {video && <p className="video-title">Video: {video.title}</p>}
        </div>
        <div className="header-actions">
          <button
            className="btn-secondary"
            onClick={() => setShowPreview(true)}
            disabled={questions.length === 0}
          >
            Preview Quiz
          </button>
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={saving || !hasDrafts}
          >
            {saving ? 'Saving...' : 'Save Questions'}
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {hasDrafts && (
        <div className="draft-notice">
          You have unsaved changes. Click "Save Questions" to publish.
        </div>
      )}

      <div className="questions-container">
        {questions.length === 0 ? (
          <div className="empty-state">
            <p>No quiz questions yet.</p>
            <button className="btn-primary" onClick={handleAddQuestion}>
              Add First Question
            </button>
          </div>
        ) : (
          <>
            {questions.map((question, index) => (
              <div
                key={index}
                className={`question-card ${question.isEditing ? 'editing' : ''} ${question.isDraft ? 'draft' : ''}`}
              >
                <div className="question-header">
                  <span className="question-number">Question {index + 1}</span>
                  <div className="question-actions">
                    <button
                      className="btn-icon"
                      onClick={() => handleMoveQuestion(index, 'up')}
                      disabled={index === 0}
                      title="Move Up"
                    >
                      ↑
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => handleMoveQuestion(index, 'down')}
                      disabled={index === questions.length - 1}
                      title="Move Down"
                    >
                      ↓
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => handleToggleEditing(index)}
                      title={question.isEditing ? 'Done' : 'Edit'}
                    >
                      {question.isEditing ? '✓' : '✎'}
                    </button>
                    <button
                      className="btn-icon btn-danger"
                      onClick={() => handleDeleteClick(index)}
                      title="Delete"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {question.isEditing ? (
                  <div className="question-edit-form">
                    <div className="form-group">
                      <label>Question Text *</label>
                      <textarea
                        value={question.questionText}
                        onChange={(e) => handleUpdateQuestion(index, 'questionText', e.target.value)}
                        placeholder="Enter your question"
                        rows={3}
                      />
                    </div>

                    <div className="options-section">
                      <label>Options * (Select the correct answer)</label>
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="option-row">
                          <input
                            type="radio"
                            name={`correct-${index}`}
                            checked={question.correctOptionIndex === optIndex}
                            onChange={() => handleUpdateQuestion(index, 'correctOptionIndex', optIndex)}
                          />
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => handleUpdateOption(index, optIndex, e.target.value)}
                            placeholder={`Option ${optIndex + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="question-preview">
                    <p className="question-text">{question.questionText || '(No question text)'}</p>
                    <div className="options-list">
                      {question.options.map((option, optIndex) => (
                        option.trim() && (
                          <div
                            key={optIndex}
                            className={`option-item ${question.correctOptionIndex === optIndex ? 'correct' : ''}`}
                          >
                            {option}
                            {question.correctOptionIndex === optIndex && (
                              <span className="correct-badge">✓ Correct</span>
                            )}
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            <button className="btn-add-question" onClick={handleAddQuestion}>
              + Add Question
            </button>
          </>
        )}
      </div>

      {/* Delete Modal */}
      {deleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Delete Question</h3>
            <p>Are you sure you want to delete this question?</p>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => { setDeleteModalOpen(false); setQuestionToDelete(null); }}
              >
                Cancel
              </button>
              <button className="btn-danger" onClick={handleConfirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="modal-overlay">
          <div className="modal preview-modal">
            <div className="modal-header">
              <h3>Quiz Preview</h3>
              <button className="btn-close" onClick={() => setShowPreview(false)}>×</button>
            </div>
            <div className="preview-content">
              {questions.map((question, index) => (
                <div key={index} className="preview-question">
                  <p className="preview-question-number">Question {index + 1}</p>
                  <p className="preview-question-text">{question.questionText}</p>
                  <div className="preview-options">
                    {question.options.map((option, optIndex) => (
                      option.trim() && (
                        <div key={optIndex} className="preview-option">
                          <span className="option-indicator">{String.fromCharCode(65 + optIndex)}</span>
                          <span>{option}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizBuilderPage;
