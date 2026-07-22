import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './create-workspace.dto';
import { UpdateWorkspaceDto } from './update-workspace.dto';
import { InvitationsService } from '../../invitations/invitations.service';
export declare class WorkspacesController {
    private readonly workspacesService;
    private readonly invitationsService;
    constructor(workspacesService: WorkspacesService, invitationsService: InvitationsService);
    findAll(userId: string): Promise<{
        memberRole: import(".prisma/client").$Enums.WorkspaceMemberRole;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        type: import(".prisma/client").$Enums.WorkspaceType;
        userId: string;
        enabledFeatures: string[];
    }[]>;
    findOne(userId: string, id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        type: import(".prisma/client").$Enums.WorkspaceType;
        userId: string;
        enabledFeatures: string[];
    }>;
    create(userId: string, dto: CreateWorkspaceDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        type: import(".prisma/client").$Enums.WorkspaceType;
        userId: string;
        enabledFeatures: string[];
    }>;
    update(userId: string, id: string, dto: UpdateWorkspaceDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        type: import(".prisma/client").$Enums.WorkspaceType;
        userId: string;
        enabledFeatures: string[];
    }>;
    remove(userId: string, id: string): Promise<void>;
    join(userId: string, data: {
        code: string;
    }): Promise<{
        success: boolean;
        workspaceId: string;
        alreadyOwner: boolean;
        alreadyMember?: undefined;
    } | {
        success: boolean;
        workspaceId: string;
        alreadyMember: boolean;
        alreadyOwner?: undefined;
    } | {
        success: boolean;
        workspaceId: string;
        alreadyOwner?: undefined;
        alreadyMember?: undefined;
    }>;
}
