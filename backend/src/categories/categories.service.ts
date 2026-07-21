import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) { }

  create(workspaceId: string, createCategoryDto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: {
        ...createCategoryDto,
        workspaceId,
      },
    } as any);
  }

  findAll(workspaceId: string) {
    return this.prisma.category.findMany({
      where: { workspaceId, deletedAt: null },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOne(workspaceId: string, id: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, workspaceId, deletedAt: null },
    });
    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }
    return category;
  }

  async update(workspaceId: string, id: string, updateCategoryDto: UpdateCategoryDto) {
    await this.findOne(workspaceId, id); // check existence and ownership
    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async remove(workspaceId: string, id: string) {
    await this.findOne(workspaceId, id); // check existence and ownership
    return this.prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}