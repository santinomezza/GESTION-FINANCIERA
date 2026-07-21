import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
    constructor(private prisma: PrismaService) { }

    create(workspaceId: string, createClientDto: CreateClientDto) {
        return this.prisma.client.create({
            data: {
                ...createClientDto,
                workspaceId,
            },
        } as any);
    }

    findAll(workspaceId: string) {
        return this.prisma.client.findMany({
            where: { workspaceId, deletedAt: null },
            orderBy: { name: 'asc' },
        });
    }

    async findOne(workspaceId: string, id: string) {
        const client = await this.prisma.client.findFirst({
            where: { id, workspaceId, deletedAt: null },
        });
        if (!client) {
            throw new NotFoundException('Cliente no encontrado');
        }
        return client;
    }

    async update(workspaceId: string, id: string, updateClientDto: UpdateClientDto) {
        await this.findOne(workspaceId, id);
        return this.prisma.client.update({
            where: { id },
            data: updateClientDto,
        });
    }

    async remove(workspaceId: string, id: string) {
        await this.findOne(workspaceId, id);
        return this.prisma.client.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
}
