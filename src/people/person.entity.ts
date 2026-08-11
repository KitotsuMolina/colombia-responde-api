import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { TerritorialLocation } from '../common/location.embedded'

@Entity('missing_persons')
export class MissingPerson {
  @PrimaryGeneratedColumn('uuid') id: string
  @Column({ name: 'full_name', length: 180 }) fullName: string
  @Column({ type: 'int', nullable: true }) age?: number
  @Column({ name: 'photo_url', type: 'text', nullable: true }) photoUrl?: string
  @Column(() => TerritorialLocation, { prefix: false }) location: TerritorialLocation
  @Column({ name: 'last_seen_at', type: 'timestamptz' }) lastSeenAt: Date
  @Column({ name: 'last_seen_details', type: 'text' }) lastSeenDetails: string
  @Column({ type: 'varchar', length: 30, default: 'missing' }) status: 'missing'|'sighting'|'located'
  @Column({ name: 'contact_token', type: 'varchar', length: 120 }) contactToken: string
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date
}
