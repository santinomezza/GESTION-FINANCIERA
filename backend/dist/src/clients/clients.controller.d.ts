import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
export declare class ClientsController {
    private readonly clientsService;
    constructor(clientsService: ClientsService);
    create(workspaceId: string, createClientDto: CreateClientDto): import(".prisma/client").Prisma.Prisma__ClientClient<{
        id: string;
        name: string;
        cuit: string | null;
        email: string | null;
        phone: string | null;
        address: string | null;
        workspaceId: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findAll(workspaceId: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        cuit: string | null;
        email: string | null;
        phone: string | null;
        address: string | null;
        workspaceId: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }[]>;
    findOne(workspaceId: string, id: string): Promise<{
        id: string;
        name: string;
        cuit: string | null;
        email: string | null;
        phone: string | null;
        address: string | null;
        workspaceId: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    update(workspaceId: string, id: string, updateClientDto: UpdateClientDto): Promise<{
        id: string;
        name: string;
        cuit: string | null;
        email: string | null;
        phone: string | null;
        address: string | null;
        workspaceId: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    remove(workspaceId: string, id: string): Promise<{
        id: string;
        name: string;
        cuit: string | null;
        email: string | null;
        phone: string | null;
        address: string | null;
        workspaceId: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
}
