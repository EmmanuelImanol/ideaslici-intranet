import { FileMetadata } from 'src/files/entities/file-metadata.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('areas')
export class Area {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 'bg-slate-100 text-slate-600' })
  colorClass: string;

  @OneToMany(() => FileMetadata, (file) => file.area)
  files: FileMetadata[];

  @OneToMany(() => User, (user) => user.area)
  users: User[];

  @CreateDateColumn()
  createdAt: Date;
}
