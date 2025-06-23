import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ShortUrl {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  originalUrl: string;

  @Column({ unique: true, length: 6 })
  shortCode: string;
}
