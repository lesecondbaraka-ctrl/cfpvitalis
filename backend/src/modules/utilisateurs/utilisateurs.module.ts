import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UtilisateursService } from './utilisateurs.service';
import { UtilisateursController } from './utilisateurs.controller';
import { JwtStrategy } from './jwt.strategy';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'vitalis_center_jwt_secret_dev'),
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
    NotificationsModule,
  ],
  controllers: [UtilisateursController],
  providers: [UtilisateursService, JwtStrategy],
  exports: [UtilisateursService, JwtModule],
})
export class UtilisateursModule {}
