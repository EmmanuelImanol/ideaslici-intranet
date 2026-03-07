import { Module } from '@nestjs/common';
import { AreasService } from './areas.service';
import { AreasController } from './areas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Area } from './entities/area.entity';
import { FileMetadata } from 'src/files/entities/file-metadata.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Area, FileMetadata])],
  controllers: [AreasController],
  providers: [AreasService],
  exports: [AreasService],
})
export class AreasModule {}
