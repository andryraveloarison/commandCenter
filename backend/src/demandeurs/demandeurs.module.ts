import { Module } from '@nestjs/common';
import { DemandeursService } from './demandeurs.service';
import { DemandeursController } from './demandeurs.controller';
import { PrismaModule } from '../common/prisma/prisma.module';

@Module({ imports: [PrismaModule], providers: [DemandeursService], controllers: [DemandeursController] })
export class DemandeursModule {}
