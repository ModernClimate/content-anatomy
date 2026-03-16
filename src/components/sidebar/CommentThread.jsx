import { useState } from 'react'
import { useCommentStore } from '@/stores/useCommentStore'
import { Check, Reply } from 'lucide-react'

export default function CommentThread({
  projectId, bubbleId, comments,
  isStrategist, currentUserId, currentUserName
}) {
  const { addComment, resolveComment } = useCommentStore()
  const [newCommentBody, setNewCommentBody] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyBody, setReplyBody] = useState('')
  const [showResolved, setShowResolved] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const topLevelComments = comments.filter(c => !c.parent_id)
  const getReplies = (parentId) => comments.filter(c => c.parent_id === parentId)

  const visibleComments = showResolved
    ? topLevelComments
    : topLevelComments.filter(c => !c.resolved)

  const resolvedCount = topLevelComments.filter(c => c.resolved).length

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!newCommentBody.trim()) return
    setSubmitting(true)
    try {
      await addComment({ projectId, bubbleId, body: newCommentBody, parentId: null, authorId: currentUserId })
      setNewCommentBody('')
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitReply = async (parentId) => {
    if (!replyBody.trim()) return
    setSubmitting(true)
    try {
      await addComment({ projectId, bubbleId, body: replyBody, parentId, authorId: currentUserId })
      setReplyBody('')
      setReplyingTo(null)
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-gray-500">
          Comments{' '}
          {comments.filter(c => !c.resolved && !c.parent_id).length > 0 && (
            <span className="bg-brand-50 text-brand-700 rounded-full px-1.5 py-0.5 ml-1 text-xs">
              {comments.filter(c => !c.resolved && !c.parent_id).length}
            </span>
          )}
        </p>
        {resolvedCount > 0 && (
          <button
            onClick={() => setShowResolved(s => !s)}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            {showResolved ? 'Hide' : 'Show'} {resolvedCount} resolved
          </button>
        )}
      </div>

      <div className="space-y-3 mb-4">
        {visibleComments.length === 0 && (
          <p className="text-xs text-gray-400 italic">No comments yet.</p>
        )}
        {visibleComments.map(comment => (
          <CommentItem
            key={comment.id}
            comment={comment}
            replies={getReplies(comment.id)}
            isStrategist={isStrategist}
            currentUserId={currentUserId}
            replyingTo={replyingTo}
            replyBody={replyBody}
            onReplyBodyChange={setReplyBody}
            onStartReply={() => setReplyingTo(comment.id)}
            onCancelReply={() => setReplyingTo(null)}
            onSubmitReply={() => handleSubmitReply(comment.id)}
            onResolve={() => resolveComment(comment.id, bubbleId, currentUserId)}
            submitting={submitting}
          />
        ))}
      </div>

      <form onSubmit={handleSubmitComment} className="space-y-2">
        <textarea
          value={newCommentBody}
          onChange={e => setNewCommentBody(e.target.value)}
          placeholder={`Add a comment as ${currentUserName}...`}
          rows={2}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button
          type="submit"
          disabled={submitting || !newCommentBody.trim()}
          className="w-full bg-brand-600 text-white rounded-lg py-1.5 text-xs font-medium hover:bg-brand-500 disabled:opacity-50"
        >
          {submitting ? 'Posting...' : 'Post Comment'}
        </button>
      </form>
    </div>
  )
}

function CommentItem({
  comment, replies, isStrategist, currentUserId,
  replyingTo, replyBody, onReplyBodyChange,
  onStartReply, onCancelReply, onSubmitReply, onResolve,
  submitting
}) {
  const timeAgo = formatTimeAgo(comment.created_at)

  return (
    <div className={`rounded-lg p-3 ${comment.resolved ? 'bg-gray-50 opacity-60' : 'bg-gray-50'}`}>
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div>
          <span className="text-xs font-medium text-gray-800">
            {comment.author?.full_name || comment.author?.email || 'Unknown'}
          </span>
          <span className="text-xs text-gray-400 ml-2">{timeAgo}</span>
        </div>
        {isStrategist && !comment.resolved && (
          <button onClick={onResolve} title="Mark as resolved" className="text-gray-300 hover:text-green-500 shrink-0">
            <Check size={13} />
          </button>
        )}
        {comment.resolved && (
          <span className="text-xs text-green-600 flex items-center gap-0.5 shrink-0">
            <Check size={11} /> Resolved
          </span>
        )}
      </div>

      <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">{comment.body}</p>

      {replies.length > 0 && (
        <div className="mt-2 pl-3 border-l border-gray-200 space-y-2">
          {replies.map(reply => (
            <div key={reply.id}>
              <span className="text-xs font-medium text-gray-700">
                {reply.author?.full_name || reply.author?.email}
              </span>
              <span className="text-xs text-gray-400 ml-1">{formatTimeAgo(reply.created_at)}</span>
              <p className="text-xs text-gray-600 mt-0.5">{reply.body}</p>
            </div>
          ))}
        </div>
      )}

      {!comment.resolved && (
        <>
          {replyingTo === comment.id ? (
            <div className="mt-2 space-y-1.5">
              <textarea
                value={replyBody}
                onChange={e => onReplyBodyChange(e.target.value)}
                placeholder="Write a reply..."
                rows={2}
                className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-brand-500"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={onSubmitReply}
                  disabled={submitting || !replyBody.trim()}
                  className="text-xs bg-brand-600 text-white px-2.5 py-1 rounded hover:bg-brand-500 disabled:opacity-50"
                >
                  Reply
                </button>
                <button onClick={onCancelReply} className="text-xs text-gray-400 hover:text-gray-600">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button onClick={onStartReply} className="mt-1.5 flex items-center gap-1 text-xs text-gray-400 hover:text-brand-600">
              <Reply size={11} /> Reply
            </button>
          )}
        </>
      )}
    </div>
  )
}

function formatTimeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}
