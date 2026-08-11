import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { TerritorialLocation } from '../common/location.embedded'

@Entity('safety_check_ins')
export class SafetyCheckIn {
  @PrimaryGeneratedColumn('uuid') id: string
  @Column({ name:'full_name', length:180 }) fullName: string
  @Column(() => TerritorialLocation, { prefix:false }) location: TerritorialLocation
  @Column({ type:'varchar', length:500, nullable:true }) message?: string
  @Index({ spatial:true })
  @Column({ type:'geography', spatialFeatureType:'Point', srid:4326, nullable:true }) coordinates?: object
  @Column({ name:'public_code', length:16, unique:true }) publicCode: string
  @Column({ name:'delete_token_hash', length:64, select:false }) deleteTokenHash: string
  @Column({ type:'varchar', length:30, default:'self_reported' }) status: 'self_reported'|'verified'|'removed'
  @Column({ name:'expires_at', type:'timestamptz' }) expiresAt: Date
  @CreateDateColumn({ name:'created_at' }) createdAt: Date
  @UpdateDateColumn({ name:'updated_at' }) updatedAt: Date
}
