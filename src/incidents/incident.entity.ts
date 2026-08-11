import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { TerritorialLocation } from '../common/location.embedded'

export type IncidentKind = 'help'|'damage'|'landslide'|'road'|'water'|'power'|'medical'|'shelter'|'aid'
export type VerificationStatus = 'unverified'|'evidence'|'community'|'verified'|'official'
export type IncidentAreaPoint = { latitude:number;longitude:number }

@Entity('incidents')
export class Incident {
  @PrimaryGeneratedColumn('uuid') id: string
  @Column({ type: 'varchar', length: 30 }) kind: IncidentKind
  @Column({ length: 160 }) title: string
  @Column({ type: 'text' }) description: string
  @Column(() => TerritorialLocation, { prefix: false }) location: TerritorialLocation
  @Index({ spatial: true })
  @Column({ type: 'geography', spatialFeatureType: 'Point', srid: 4326 }) coordinates: object
  @Column({ type:'jsonb', nullable:true }) area?: IncidentAreaPoint[]
  @Column({ name: 'people_at_risk', type: 'int', nullable: true }) peopleAtRisk?: number
  @Column({ name: 'verification_status', type: 'varchar', length: 30, default: 'unverified' }) verificationStatus: VerificationStatus
  @Column({ name: 'confirmation_count', type: 'int', default: 0 }) confirmationCount: number
  @Column({ type: 'varchar', length: 20, default: 'active' }) status: 'active'|'resolved'|'archived'
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date
}
