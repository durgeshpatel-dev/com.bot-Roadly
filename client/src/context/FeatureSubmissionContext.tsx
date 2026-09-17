import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { AuthPromptDialog } from '../components/auth/AuthPromptDialog';
import { PostForm } from '../components/posts/PostForm';
import { useAuth } from './AuthContext';

interface FeatureSubmissionContextValue {
  openSubmission: () => void;
}

const FeatureSubmissionContext = createContext<FeatureSubmissionContextValue | undefined>(undefined);

export function FeatureSubmissionProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [postFormOpen, setPostFormOpen] = useState(false);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);

  const openSubmission = () => {
    if (isAuthenticated) setPostFormOpen(true);
    else setAuthPromptOpen(true);
  };

  return (
    <FeatureSubmissionContext.Provider value={{ openSubmission }}>
      {children}
      <PostForm open={postFormOpen} onOpenChange={setPostFormOpen} />
      <AuthPromptDialog open={authPromptOpen} onOpenChange={setAuthPromptOpen} />
    </FeatureSubmissionContext.Provider>
  );
}

export function useFeatureSubmission() {
  const context = useContext(FeatureSubmissionContext);

  if (!context) throw new Error('useFeatureSubmission must be used within a FeatureSubmissionProvider');

  return context;
}
