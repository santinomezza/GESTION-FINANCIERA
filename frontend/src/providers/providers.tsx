'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';
import { ThemeProvider } from '@/components/theme-provider';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));

  const { setUser, setWorkspaces, activeWorkspaceId, checkAuth } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    checkAuth();
    
    const fetchUser = async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data);

        try {
          const { data: workspaces } = await api.get('/workspaces');
          setWorkspaces(workspaces);
        } catch {
          // Workspaces may not be available
        }
      } catch (error) {
        setUser(null);
      }
    };
    
    fetchUser();
  }, [checkAuth, setUser, setWorkspaces]);

  useEffect(() => {
    if (activeWorkspaceId) {
      queryClient.invalidateQueries();
    }
  }, [activeWorkspaceId, queryClient]);

  if (!isMounted) return null;

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ThemeProvider>
  );
}
