import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { User } from '../models/User';
import { Post } from '../models/Post';
import { Comment } from '../models/Comment';

dotenv.config({ path: path.join(__dirname, '../../.env') });
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/roadly';

const mockUsers = [
  { name: 'Alex Developer', email: 'alex@example.mock', password: 'password123', role: 'user', isVerified: true },
  { name: 'Sarah Designer', email: 'sarah@example.mock', password: 'password123', role: 'user', isVerified: true },
  { name: 'Mike PM', email: 'mike@example.mock', password: 'password123', role: 'user', isVerified: true },
  { name: 'Emma QA', email: 'emma@example.mock', password: 'password123', role: 'user', isVerified: true },
  { name: 'David Ops', email: 'david@example.mock', password: 'password123', role: 'user', isVerified: true }
];

const featureIdeas = [
  { title: 'Dark Mode Support', category: 'ui-ux', status: 'completed' },
  { title: 'Slack Integration', category: 'integrations', status: 'planned' },
  { title: 'Jira Sync', category: 'integrations', status: 'in-progress' },
  { title: 'Faster Page Loads', category: 'performance', status: 'under-review' },
  { title: 'Mobile App', category: 'general', status: 'planned' },
  { title: 'SSO Login', category: 'integrations', status: 'under-review' },
  { title: 'Export to CSV', category: 'general', status: 'completed' },
  { title: 'Bulk Editing', category: 'general', status: 'in-progress' },
  { title: 'Custom Themes', category: 'ui-ux', status: 'rejected' },
  { title: 'Webhooks', category: 'integrations', status: 'planned' },
  { title: 'Keyboard Shortcuts', category: 'ui-ux', status: 'in-progress' },
  { title: 'API Rate Limiting', category: 'performance', status: 'completed' },
  { title: 'Dashboard Widgets', category: 'ui-ux', status: 'under-review' },
  { title: 'Email Notifications', category: 'general', status: 'planned' },
  { title: 'Two-Factor Auth', category: 'integrations', status: 'in-progress' },
  { title: 'Audit Logs', category: 'general', status: 'completed' },
  { title: 'Role-Based Access', category: 'general', status: 'under-review' },
  { title: 'Image Uploads', category: 'general', status: 'planned' },
  { title: 'Comment Threads', category: 'general', status: 'completed' },
  { title: 'Markdown Support', category: 'ui-ux', status: 'in-progress' },
  { title: 'Search Highlighting', category: 'ui-ux', status: 'rejected' },
  { title: 'Offline Mode', category: 'performance', status: 'under-review' },
  { title: 'Multi-Language Support', category: 'general', status: 'planned' },
  { title: 'Data Encryption', category: 'performance', status: 'in-progress' },
  { title: 'Analytics Dashboard', category: 'general', status: 'completed' }
];

const mockComments = [
  "This is a fantastic idea! I'd love to see this implemented.",
  "We really need this for our workflow.",
  "Could we also add support for custom filters with this?",
  "I think this should be a high priority.",
  "Great suggestion. Any ETA on when this might be planned?",
  "This would save us so much time.",
  "I'm not sure this is the best approach, maybe we could do it differently?",
  "Yes! Please add this.",
  "I've been waiting for this feature for a long time.",
  "Looks good to me."
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB');

    // Create users
    let dbUsers = await User.find({ email: { $in: mockUsers.map(u => u.email) } });
    if (dbUsers.length === 0) {
      dbUsers = await User.insertMany(mockUsers);
      console.log(`Created ${dbUsers.length} mock users`);
    }

    // Create posts
    const createdPosts = [];
    for (const idea of featureIdeas) {
      const author = dbUsers[Math.floor(Math.random() * dbUsers.length)];
      
      // Random voters
      const numVoters = Math.floor(Math.random() * 5);
      const voters = dbUsers.slice(0, numVoters).map(u => u._id);

      const post = new Post({
        title: idea.title,
        description: `This is a detailed description for the feature request: ${idea.title}. We believe this will greatly improve the user experience and provide immense value to all users of the platform. Please consider adding this in the next release cycle.`,
        author: author._id,
        categories: [idea.category],
        status: idea.status,
        voters: voters,
        voteCount: voters.length,
        commentCount: 0 // Will update later
      });
      await post.save();
      createdPosts.push(post);
    }
    console.log(`Created ${createdPosts.length} posts`);

    // Create comments
    let commentCount = 0;
    for (const post of createdPosts) {
      const numComments = Math.floor(Math.random() * 4) + 1;
      for (let i = 0; i < numComments; i++) {
        const author = dbUsers[Math.floor(Math.random() * dbUsers.length)];
        const content = mockComments[Math.floor(Math.random() * mockComments.length)];
        
        const comment = new Comment({
          content,
          author: author._id,
          post: post._id
        });
        await comment.save();
        commentCount++;
      }
      post.commentCount = numComments;
      await post.save();
    }
    console.log(`Created ${commentCount} comments`);

    console.log('Done!');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

seed();
