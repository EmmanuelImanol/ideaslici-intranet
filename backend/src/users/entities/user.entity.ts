import { Area } from 'src/areas/entities/area.entity';
import { Role } from 'src/common/interfaces/roles.enum';
import { FileMetadata } from 'src/files/entities/file-metadata.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  DeleteDateColumn,
  UpdateDateColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  // --- DATOS PERSONALES ---
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.EMPLEADO,
  })
  role: Role;

  // --- AUDITORÍA Y ESTADO ---
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn() // <--- Esta columna gestiona el borrado lógico
  deletedAt: Date;

  @OneToMany(() => FileMetadata, (file) => file.uploadedBy)
  files: FileMetadata[];

  @Column({ nullable: true })
  areaId: number;

  @ManyToOne(() => Area, (area) => area.users, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'areaId' })
  area: Area;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
