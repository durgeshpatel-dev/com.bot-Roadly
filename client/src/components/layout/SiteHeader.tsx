import { useState } from 'react';
import { Menu as MenuIcon, Plus, ShieldCheck, UserRound } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useFeatureSubmission } from '../../context/FeatureSubmissionContext';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetHeader, SheetPanel, SheetTitle, SheetTrigger } from '../ui/sheet';
import { Spinner } from '../ui/spinner';
import { toastManager } from '../ui/toast';
import { ThemeToggle } from './ThemeToggle';

const mainLinks = [
  { to: '/', label: 'Feature requests', end: true },
  { to: '/roadmap', label: 'Roadmap' },
];

function HeaderNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Primary navigation" className="flex flex-col gap-1 md:flex-row md:items-center">
      {mainLinks.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          onClick={onNavigate}
          className={({ isActive }) => cn('nav-link', isActive && 'nav-link-active')}
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}

export function SiteHeader() {
  const { isAuthenticated, isLoading, logout, user } = useAuth();
  const { openSubmission } = useFeatureSubmission();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const submitFeature = () => {
    setMobileNavOpen(false);
    openSubmission();
  };

  const signOut = async () => {
    setMobileNavOpen(false);
    try {
      await logout();
    } catch {
      toastManager.add({ type: 'error', title: 'Server sign out failed', description: 'Your local session was cleared. Please retry when connected.' });
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="site-container flex h-16 items-center justify-between gap-3">
        <NavLink to="/" className="flex items-center gap-2 font-heading text-lg font-semibold tracking-tight">
          <span className="grid size-7 place-items-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">R</span>
          Roadly
        </NavLink>

        <div className="hidden items-center gap-1 md:flex">
          <HeaderNav />
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Button size="sm" onClick={openSubmission}><Plus aria-hidden="true" />Submit feature</Button>
          <ThemeToggle />
          {isLoading ? <Spinner className="size-4" /> : isAuthenticated ? (
            <>
              {user?.role === 'admin' && (
                <NavLink to="/admin" className={({ isActive }) => cn('nav-link', isActive && 'nav-link-active')}>
                  <ShieldCheck aria-hidden="true" className="mr-1 inline size-4" />Admin
                </NavLink>
              )}
              <span className="hidden max-w-32 truncate text-sm text-muted-foreground lg:inline">{user?.name}</span>
              <Button variant="outline" size="sm" onClick={signOut}>Sign out</Button>
            </>
          ) : (
            <>
              <Button render={<NavLink to="/login" />} variant="ghost" size="sm">Sign in</Button>
              <Button render={<NavLink to="/signup" />} variant="outline" size="sm">Create account</Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger render={<Button variant="outline" size="icon" aria-label="Open navigation" />}>
              <MenuIcon aria-hidden="true" />
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader><SheetTitle>Roadly navigation</SheetTitle></SheetHeader>
              <SheetPanel className="space-y-5">
                <HeaderNav onNavigate={() => setMobileNavOpen(false)} />
                <Button className="w-full" onClick={submitFeature}><Plus aria-hidden="true" />Submit feature</Button>
                <div className="border-t pt-5">
                  {isLoading ? <Spinner className="size-5" /> : isAuthenticated ? (
                    <div className="space-y-3">
                      <p className="flex items-center gap-2 text-sm text-muted-foreground"><UserRound aria-hidden="true" className="size-4" />{user?.name}</p>
                      {user?.role === 'admin' && <NavLink to="/admin" onClick={() => setMobileNavOpen(false)} className="nav-link flex items-center gap-2"><ShieldCheck aria-hidden="true" className="size-4" />Admin</NavLink>}
                      <Button variant="outline" className="w-full" onClick={signOut}>Sign out</Button>
                    </div>
                  ) : (
                    <div className="grid gap-2">
                      <Button render={<NavLink to="/login" />} onClick={() => setMobileNavOpen(false)} variant="outline" className="w-full">Sign in</Button>
                      <Button render={<NavLink to="/signup" />} onClick={() => setMobileNavOpen(false)} className="w-full">Create account</Button>
                    </div>
                  )}
                </div>
              </SheetPanel>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
