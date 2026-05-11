import { Module } from '@nestjs/common';
import { InterventionsService } from './interventions.service';
import { InterventionsController } from './interventions.controller';
import { PrismaModule } from '../common/prisma/prisma.module';

@Module({ imports: [PrismaModule], providers: [InterventionsService], controllers: [InterventionsController] })
export class InterventionsModule {}
