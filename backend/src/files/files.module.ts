import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileMetadata } from './entities/file-metadata.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FileMetadata])],
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule {}
