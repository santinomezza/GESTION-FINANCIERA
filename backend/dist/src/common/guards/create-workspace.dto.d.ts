import { WorkspaceType } from '@prisma/client';
export declare class CreateWorkspaceDto {
    name: string;
    type: WorkspaceType;
    description?: string;
}
