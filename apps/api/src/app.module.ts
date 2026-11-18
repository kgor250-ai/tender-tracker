import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from './prisma/prisma.service';
import { AuthController } from './modules/auth/auth.controller';
import { AuthService } from './modules/auth/auth.service';
import { TendersController } from './modules/tenders/tenders.controller';
import { TendersService } from './modules/tenders/tenders.service';
import { AmendmentsController } from './modules/amendments/amendments.controller';
import { AmendmentsService } from './modules/amendments/amendments.service';
import { ReviewsController } from './modules/reviews/reviews.controller';
import { ReviewsService } from './modules/reviews/reviews.service';
import { NotificationsController } from './modules/notifications/notifications.controller';
import { NotificationsService } from './modules/notifications/notifications.service';
import { AdminController } from './modules/admin/admin.controller';
import { AdminService } from './modules/admin/admin.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.AUTH_SECRET || 'super-secret-development-key-change-in-production-min-32-chars',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [
    AuthController,
    TendersController,
    AmendmentsController,
    ReviewsController,
    NotificationsController,
    AdminController,
  ],
  providers: [
    PrismaService,
    AuthService,
    TendersService,
    AmendmentsService,
    ReviewsService,
    NotificationsService,
    AdminService,
  ],
})
export class AppModule {}

