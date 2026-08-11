import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { TerritorialLocation } from '../common/location.embedded'

@Entity('resources')
export class EmergencyResource {
  @PrimaryGeneratedColumn('uuid') id: string
  @Column({ type:'varchar', length:30 }) type: 'medical'|'shelter'|'water'|'food'|'aid'
  @Column({ length:180 }) name: string
  @Column({ type:'text' }) description: string
  @Column(() => TerritorialLocation, { prefix: false }) location: TerritorialLocation
  @Index({ spatial:true })
  @Column({ type:'geography', spatialFeatureType:'Point', srid:4326 }) coordinates: object
  @Column({ name:'source_name', length:180 }) sourceName: string
  @Column({ name:'source_url', type:'text', nullable:true }) sourceUrl?: string
  @Column({ name:'verified_at', type:'timestamptz', nullable:true }) verifiedAt?: Date
  @Column({ type:'boolean', default:true }) active: boolean
  @CreateDateColumn({ name:'created_at' }) createdAt: Date
  @UpdateDateColumn({ name:'updated_at' }) updatedAt: Date
}
