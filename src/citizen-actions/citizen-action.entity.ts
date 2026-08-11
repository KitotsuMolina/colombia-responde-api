import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity('citizen_actions')
export class CitizenAction {
  @PrimaryGeneratedColumn('uuid') id:string
  @Column({length:160}) title:string
  @Column({name:'contact_name',length:180}) contactName:string
  @Column({name:'contact_phone',length:40}) contactPhone:string
  @Column({name:'action_description',type:'text'}) actionDescription:string
  @Column({name:'donation_method',type:'text',nullable:true}) donationMethod?:string
  @Column({name:'department_name',length:100}) departmentName:string
  @Column({name:'municipality_name',length:120}) municipalityName:string
  @Column({name:'locality',length:180,nullable:true}) locality?:string
  @Column({type:'varchar',length:20,default:'pending'}) status:'pending'|'published'
  @Column({name:'validation_token_hash',type:'char',length:64,nullable:true,unique:true,select:false}) validationTokenHash?:string|null
  @Column({name:'validation_expires_at',type:'timestamptz'}) validationExpiresAt:Date
  @Column({name:'consented_at',type:'timestamptz',nullable:true}) consentedAt?:Date
  @CreateDateColumn({name:'created_at'}) createdAt:Date
  @UpdateDateColumn({name:'updated_at'}) updatedAt:Date
}
