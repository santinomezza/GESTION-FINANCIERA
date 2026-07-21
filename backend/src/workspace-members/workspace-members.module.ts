import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/prisma/prisma.module';
import { WorkspaceMembersService } from './workspace-members.service';
import { WorkspaceMembersController } from './workspace-members.controller';

@Module({
    imports: [PrismaModule],
    controllers: [WorkspaceMembersController],
    providers: [WorkspaceMembersService],
    exports: [WorkspaceMembersService],
})
export class WorkspaceMembersModule { }