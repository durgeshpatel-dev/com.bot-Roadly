import mongoose, { Document, Schema } from 'mongoose';
import { POST_STATUSES, PostStatus } from '../constants/postStatus';

export const ACTIVITY_EVENT_TYPES = [
  'post-created',
  'status-changed',
  'comment-created',
] as const;

export type ActivityEventType = (typeof ACTIVITY_EVENT_TYPES)[number];

export interface ActivityMetadata {
  fromStatus?: PostStatus;
  toStatus?: PostStatus;
}

export interface IActivity extends Document {
  post: mongoose.Types.ObjectId;
  type: ActivityEventType;
  actor: mongoose.Types.ObjectId;
  metadata?: ActivityMetadata;
  createdAt: Date;
  updatedAt: Date;
}

const activityMetadataSchema = new Schema<ActivityMetadata>(
  {
    fromStatus: { type: String, enum: POST_STATUSES },
    toStatus: { type: String, enum: POST_STATUSES },
  },
  { _id: false }
);

const activitySchema = new Schema<IActivity>(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    type: {
      type: String,
      enum: ACTIVITY_EVENT_TYPES,
      required: true,
    },
    actor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    metadata: activityMetadataSchema,
  },
  { timestamps: true }
);

activitySchema.index({ post: 1, createdAt: -1 });

export const Activity = mongoose.model<IActivity>('Activity', activitySchema);
