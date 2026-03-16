import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

export const useCommentStore = create((set, get) => ({
  // { [bubbleId]: Comment[] }
  commentsByBubble: {},
  // { [bubbleId]: number } unresolved count per bubble
  unresolvedCounts: {},
  loading: false,
  realtimeChannel: null,

  // Load all comments for a project (for badge counts)
  loadAllCounts: async (projectId) => {
    const { data } = await supabase
      .from('comments')
      .select('bubble_id, resolved')
      .eq('project_id', projectId)

    if (!data) return

    const counts = {}
    data.forEach(c => {
      if (!c.resolved) {
        counts[c.bubble_id] = (counts[c.bubble_id] || 0) + 1
      }
    })
    set({ unresolvedCounts: counts })
  },

  // Load full comment thread for a specific bubble
  loadComments: async (projectId, bubbleId) => {
    set({ loading: true })
    const { data } = await supabase
      .from('comments')
      .select(`
        id, body, resolved, created_at, parent_id,
        author:profiles(id, full_name, email),
        resolved_by_profile:profiles!resolved_by(full_name)
      `)
      .eq('project_id', projectId)
      .eq('bubble_id', bubbleId)
      .order('created_at', { ascending: true })

    if (data) {
      set(state => ({
        commentsByBubble: { ...state.commentsByBubble, [bubbleId]: data },
        loading: false
      }))
    } else {
      set({ loading: false })
    }
  },

  // Add a new comment
  addComment: async ({ projectId, bubbleId, body, parentId, authorId }) => {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        project_id: projectId,
        bubble_id: bubbleId,
        author_id: authorId,
        body: body.trim(),
        parent_id: parentId || null
      })
      .select(`
        id, body, resolved, created_at, parent_id,
        author:profiles(id, full_name, email)
      `)
      .single()

    if (error) throw error

    // Optimistic update
    set(state => {
      const existing = state.commentsByBubble[bubbleId] || []
      const counts = { ...state.unresolvedCounts }
      counts[bubbleId] = (counts[bubbleId] || 0) + 1
      return {
        commentsByBubble: { ...state.commentsByBubble, [bubbleId]: [...existing, data] },
        unresolvedCounts: counts
      }
    })

    return data
  },

  // Mark comment as resolved
  resolveComment: async (commentId, bubbleId, resolvedById) => {
    const { error } = await supabase
      .from('comments')
      .update({
        resolved: true,
        resolved_by: resolvedById,
        resolved_at: new Date().toISOString()
      })
      .eq('id', commentId)

    if (error) throw error

    set(state => {
      const updated = (state.commentsByBubble[bubbleId] || []).map(c =>
        c.id === commentId ? { ...c, resolved: true } : c
      )
      const unresolvedCount = updated.filter(c => !c.resolved).length
      return {
        commentsByBubble: { ...state.commentsByBubble, [bubbleId]: updated },
        unresolvedCounts: { ...state.unresolvedCounts, [bubbleId]: unresolvedCount }
      }
    })
  },

  // Subscribe to realtime comment inserts for a project
  subscribeToComments: (projectId) => {
    const existing = get().realtimeChannel
    if (existing) existing.unsubscribe()

    const channel = supabase
      .channel(`comments:project:${projectId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'comments',
        filter: `project_id=eq.${projectId}`
      }, async (payload) => {
        const newComment = payload.new
        const { data: author } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .eq('id', newComment.author_id)
          .single()

        const commentWithAuthor = { ...newComment, author }

        set(state => {
          const bubbleId = newComment.bubble_id
          const existing = state.commentsByBubble[bubbleId] || []
          // Only add if not already present (avoid duplicate from own insert)
          const alreadyExists = existing.some(c => c.id === newComment.id)
          if (alreadyExists) return state

          const counts = { ...state.unresolvedCounts }
          if (!newComment.resolved) counts[bubbleId] = (counts[bubbleId] || 0) + 1

          return {
            commentsByBubble: { ...state.commentsByBubble, [bubbleId]: [...existing, commentWithAuthor] },
            unresolvedCounts: counts
          }
        })
      })
      .subscribe()

    set({ realtimeChannel: channel })
  },

  unsubscribe: () => {
    const channel = get().realtimeChannel
    if (channel) {
      channel.unsubscribe()
      set({ realtimeChannel: null })
    }
  }
}))
