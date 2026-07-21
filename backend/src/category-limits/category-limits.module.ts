import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/prisma/prisma.module';
import { CategoryLimitsService } from './category-limits.service';
import { CategoryLimitsController } from './category-limits.controller';

@Module({
    imports: [PrismaModule],
    controllers: [CategoryLimitsController],
    providers: [CategoryLimitsService],
    exports: [CategoryLimitsService],
})
export class CategoryLimitsModule { }