import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ModulesHierarchyModule } from './modules/modules.module';
import { ChatModule } from './chat/chat.module';
import { DirectMessagesModule } from './direct-messages/direct-messages.module';
import { SitesModule } from './sites/sites.module';
import { DemandeursModule } from './demandeurs/demandeurs.module';
import { InterventionsModule } from './interventions/interventions.module';
import { VersionsModule } from './versions/versions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    TasksModule,
    NotificationsModule,
    ModulesHierarchyModule,
    ChatModule,
    DirectMessagesModule,
    SitesModule,
    DemandeursModule,
    InterventionsModule,
    VersionsModule,
  ],
})
export class AppModule {}
