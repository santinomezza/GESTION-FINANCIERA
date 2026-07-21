import { useAuthStore } from '@/store/useAuthStore';
import { WorkspaceMemberRole } from '@/types';

const WRITE_ROLES: WorkspaceMemberRole[] = ['OWNER', 'ADMIN'];

export function useCanWrite(): boolean {
  const role = useAuthStore((s) => s.activeWorkspaceMemberRole);
  if (!role) return true; // If no role is set (personal workspace owner), allow writes
  return WRITE_ROLES.includes(role);
}

export function useWorkspaceRole(): WorkspaceMemberRole | null {
  return useAuthStore((s) => s.activeWorkspaceMemberRole);
}
