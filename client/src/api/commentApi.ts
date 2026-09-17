import api from './axios';
export interface IComment {
  _id: string;
  content: string;
  author: { _id: string; name: string };
  post: string;
  parentComment: string | null;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  replies?: IComment[];
}
export interface CommentResponse {
  comments: IComment[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const commentApi = {
  getComments: async (postId: string, page = 1, limit = 20): Promise<CommentResponse> => {
    const response = await api.get(`/posts/${postId}/comments`, { params: { page, limit } });
    return response.data.data;
  },

  createComment: async ({ postId, content, parentComment }: { postId: string, content: string, parentComment?: string | null }) => {
    const response = await api.post(`/posts/${postId}/comments`, { content, parentComment });
    return response.data.data.comment;
  },

  updateComment: async ({ commentId, content }: { commentId: string, content: string }) => {
    const response = await api.put(`/comments/${commentId}`, { content });
    return response.data.data.comment;
  },

  deleteComment: async (commentId: string) => {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  }
};
