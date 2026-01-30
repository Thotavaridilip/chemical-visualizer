import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface User {
  username: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Demo credentials - in production, this would be handled by Django backend
const DEMO_CREDENTIALS = {
  username: 'admin',
  password: 'admin123',
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Demo authentication - replace with Django API call
    if (username === DEMO_CREDENTIALS.username && password === DEMO_CREDENTIALS.password) {
      setUser({ username });
      return { success: true };
    }

    return { success: false, error: 'Invalid username or password' };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
