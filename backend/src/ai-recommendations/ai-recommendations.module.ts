import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/prisma/prisma.module';
import { AIRecommendationsService } from './ai-recommendations.service';
import { AIRecommendationsController } from './ai-recommendations.controller';

@Module({
    imports: [PrismaModule],
    controllers: [AIRecommendationsController],
    providers: [AIRecommendationsService],
    exports: [AIRecommendationsService],
})
export class AIRecommendationsModule { }