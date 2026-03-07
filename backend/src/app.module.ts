import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AppService } from './app.service';
import { FilesModule } from './files/files.module';
import { AreasModule } from './areas/areas.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: typeOrmConfig,
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    FilesModule,
    AreasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
