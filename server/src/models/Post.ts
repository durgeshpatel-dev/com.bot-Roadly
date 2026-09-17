import mongoose, { Document, Schema } from 'mongoose';
import { POST_STATUSES, PostStatus } from '../constants/postStatus';

export interface IPost extends Document {
  title: string;
  description: string;
  author: mongoose.Types.ObjectId;
  categories: string[];
  status: PostStatus;
  voters: mongoose.Types.ObjectId[];
  voteCount: number;
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 150,
    },
    description: {
      type: String,
      required: true,
      minlength: 20,
      maxlength: 5000,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    categories: {
      type: [String],
      required: true,
      enum: ['ui-ux', 'integrations', 'performance', 'general'],
      validate: {
        validator: function(v: string[]) {
          return v && v.length > 0;
        },
        message: 'At least one category is required',
      },
    },
    status: {
      type: String,
      required: true,
      enum: POST_STATUSES,
      default: 'under-review',
    },
    voters: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    voteCount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    commentCount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes documented in 04-DATABASE-DESIGN.md:
// 1. Text search on title and description: Required for full-text search feature.
postSchema.index({ title: 'text', description: 'text' });
// 2. { status: 1, createdAt: -1 }: Compound index required for Roadmap queries and status-filtered feeds.
postSchema.index({ status: 1, createdAt: -1 });
// 3. { voteCount: -1 }: Required for sorting posts by "Most Upvoted".
postSchema.index({ voteCount: -1 });
// 4. { commentCount: -1 }: Required for sorting posts by "Most Discussed".
postSchema.index({ commentCount: -1 });
// 5. { createdAt: -1 }: Required for sorting posts by "Newest" (default sort).
postSchema.index({ createdAt: -1 });
// 6. { author: 1 }: Required for fetching posts for the "My Requests" page efficiently.
postSchema.index({ author: 1 });

export const Post = mongoose.model<IPost>('Post', postSchema);
