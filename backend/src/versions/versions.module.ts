import { Module } from '@nestjs/common';
import { VersionsService } from './versions.service';
import { VersionsController } from './versions.controller';
import { PrismaModule } from '../common/prisma/prisma.module';

@Module({ imports: [PrismaModule], providers: [VersionsService], controllers: [VersionsController] })
export class VersionsModule {}
