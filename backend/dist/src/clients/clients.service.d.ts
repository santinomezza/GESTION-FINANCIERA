import { PrismaService } from '../common/prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
export declare class ClientsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(workspaceId: string, createClientDto: CreateClientDto): import(".prisma/client").Prisma.Prisma__ClientClient<{
        id: string;
        email: string | null;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        workspaceId: string;
        cuit: string | null;
        phone: string | null;
        address: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findAll(workspaceId: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        email: string | null;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        workspaceId: string;
        cuit: string | null;
        phone: string | null;
        address: string | null;
    }[]>;
    findOne(workspaceId: string, id: string): Promise<{
        id: string;
        email: string | null;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        workspaceId: string;
        cuit: string | null;
        phone: string | null;
        address: string | null;
    }>;
    update(workspaceId: string, id: string, updateClientDto: UpdateClientDto): Promise<{
        id: string;
        email: string | null;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        workspaceId: string;
        cuit: string | null;
        phone: string | null;
        address: string | null;
    }>;
    remove(workspaceId: string, id: string): Promise<{
        id: string;
        email: string | null;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        workspaceId: string;
        cuit: string | null;
        phone: string | null;
        address: string | null;
    }>;
}
