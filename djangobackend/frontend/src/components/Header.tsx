import React from 'react';
import { Beaker, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary">
            <Beaker className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">
              Chemical Equipment Visualizer
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Parameter Analysis Dashboard
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated && user && (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary">
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-accent" />
                </div>
                <span className="text-sm font-medium text-foreground">{user.username}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
