import { Module } from '@nestjs/common';
import { SitesService } from './sites.service';
import { SitesController } from './sites.controller';
import { PrismaModule } from '../common/prisma/prisma.module';

@Module({ imports: [PrismaModule], providers: [SitesService], controllers: [SitesController] })
export class SitesModule {}
