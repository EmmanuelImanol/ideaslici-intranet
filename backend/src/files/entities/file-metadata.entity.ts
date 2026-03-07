import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  DeleteDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Area } from 'src/areas/entities/area.entity';

@Entity('files_metadata')
export class FileMetadata {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  category: string;

  @Column()
  storageName: string; // El nombre con el prefijo/suffix único (ej: 172839-archivo.pdf)

  @Column()
  originalName: string; // El nombre real que tenía el archivo (ej: manual.pdf)

  @Column()
  mimeType: string; // Para saber si es pdf, mp4, etc.

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn() // <--- Esta columna gestiona el borrado lógico
  deletedAt: Date;

  // Relacionamos el archivo con el usuario que lo subió
  @ManyToOne(() => User, (user) => user.files, { nullable: false })
  uploadedBy: User;

  @ManyToOne(() => Area, (area) => area.files, { nullable: true })
  area: Area;
}
