import { create } from 'zustand';
import { User, Workspace, WorkspaceMemberRole } from '@/types';
import Cookies from 'js-cookie';

interface AuthState {
  user: User | null;
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  activeWorkspaceMemberRole: WorkspaceMemberRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setWorkspaces: (workspaces: Workspace[], activeWorkspaceMemberRole?: WorkspaceMemberRole, defaultWorkspaceId?: string) => void;
  setActiveWorkspace: (workspaceId: string, role?: WorkspaceMemberRole) => void;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  workspaces: [],
  activeWorkspaceId: null,
  activeWorkspaceMemberRole: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => {
    set({ user, isAuthenticated: !!user, isLoading: false });
  },
  setWorkspaces: (workspaces, activeWorkspaceMemberRole, defaultWorkspaceId?: string) => {
    const storedId = defaultWorkspaceId || Cookies.get('workspace_id');
    const personal = workspaces.find(w => w.type === 'PERSONAL');
    const business = workspaces.find(w => w.type === 'BUSINESS');
    const first = workspaces[0];
    const id = storedId && workspaces.some(w => w.id === storedId)
      ? storedId
      : (business?.id || personal?.id || first?.id || null);
    const activeWs = workspaces.find(w => w.id === id);
    const role = activeWorkspaceMemberRole || activeWs?.memberRole || null;
    set({ workspaces, activeWorkspaceId: id, activeWorkspaceMemberRole: role });
    if (id) {
      Cookies.set('workspace_id', id, { expires: 7 });
    }
  },
  setActiveWorkspace: (workspaceId, role) => {
    const workspaces = useAuthStore.getState().workspaces;
    const ws = workspaces.find(w => w.id === workspaceId);
    const finalRole = role || ws?.memberRole || null;
    set({ activeWorkspaceId: workspaceId, activeWorkspaceMemberRole: finalRole });
    Cookies.set('workspace_id', workspaceId, { expires: 7 });
  },
  logout: () => {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    Cookies.remove('user_id');
    Cookies.remove('workspace_id');
    set({ user: null, workspaces: [], activeWorkspaceId: null, activeWorkspaceMemberRole: null, isAuthenticated: false, isLoading: false });
  },
  checkAuth: () => {
    const token = Cookies.get('access_token');
    if (!token) {
      set({ user: null, workspaces: [], activeWorkspaceId: null, activeWorkspaceMemberRole: null, isAuthenticated: false, isLoading: false });
    }
  }
}));
