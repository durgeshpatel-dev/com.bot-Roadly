import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';

export function AuthPromptDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const navigate = useNavigate();

  const goTo = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign in to participate</DialogTitle>
          <DialogDescription>
            Create an account or sign in to vote and join feature discussions.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => goTo('/login')}>Sign in</Button>
          <Button onClick={() => goTo('/signup')}>Create account</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
