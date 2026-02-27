import { Link, useRouterState } from '@tanstack/react-router';
import { Activity, LayoutDashboard, History, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAutonomousMonitor } from '../hooks/useAutonomousMonitor';
import { SuggestionBox } from './SuggestionBox';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/history', label: 'History', icon: History },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { isActive, error } = useAutonomousMonitor();

  const monitoringActive = isActive && !error;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="relative w-8 h-8 flex items-center justify-center rounded-lg bg-teal/10 border border-teal/30 group-hover:bg-teal/20 transition-colors">
                <Activity className="w-4.5 h-4.5 text-teal" strokeWidth={2.5} />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-teal pulse-dot" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-sm font-bold tracking-tight text-foreground">VitalsTracker</span>
                <span className="text-[10px] text-muted-foreground font-mono tracking-widest uppercase">24/7 · 365</span>
              </div>
            </Link>

            {/* Desktop Nav + Monitoring Pill */}
            <div className="hidden md:flex items-center gap-3">
              <nav className="flex items-center gap-1">
                {navItems.map(({ path, label, icon: Icon }) => {
                  const isActive = currentPath === path;
                  return (
                    <Link
                      key={path}
                      to={path}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-teal/15 text-teal border border-teal/25'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </Link>
                  );
                })}
              </nav>

              {/* Monitoring status pill */}
              <MonitoringPill active={monitoringActive} />
            </div>

            {/* Mobile: pill + menu button */}
            <div className="flex md:hidden items-center gap-2">
              <MonitoringPill active={monitoringActive} compact />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <nav className="flex flex-col gap-1 p-3">
              {navItems.map(({ path, label, icon: Icon }) => {
                const isActive = currentPath === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-teal/15 text-teal border border-teal/25'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Healthy Activity Suggestion Box */}
      <SuggestionBox />

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-teal" />
              <span>VitalsTracker © {new Date().getFullYear()} — Continuous health monitoring</span>
            </div>
            <span>
              Built with{' '}
              <span className="text-status-critical">♥</span>{' '}
              using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== 'undefined' ? window.location.hostname : 'vitals-tracker')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal hover:text-teal-bright transition-colors"
              >
                caffeine.ai
              </a>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface MonitoringPillProps {
  active: boolean;
  compact?: boolean;
}

function MonitoringPill({ active, compact = false }: MonitoringPillProps) {
  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono tracking-wider border transition-colors ${
          active
            ? 'bg-teal/15 text-teal border-teal/30'
            : 'bg-muted text-muted-foreground border-border'
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-teal pulse-dot' : 'bg-muted-foreground'}`}
        />
        {active ? 'LIVE' : 'OFF'}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold font-mono tracking-wider border transition-colors ${
        active
          ? 'bg-teal/15 text-teal border-teal/30'
          : 'bg-muted text-muted-foreground border-border'
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full ${active ? 'bg-teal pulse-dot' : 'bg-muted-foreground'}`}
      />
      {active ? '● MONITORING' : '○ INACTIVE'}
    </span>
  );
}
