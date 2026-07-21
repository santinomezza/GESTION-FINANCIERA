import { Module } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { WorkspacesController } from './workspaces.controller';
import { InvitationsModule } from '../../invitations/invitations.module';

@Module({
    imports: [InvitationsModule],
    controllers: [WorkspacesController],
    providers: [WorkspacesService],
    exports: [WorkspacesService],
})
export class WorkspacesModule { }