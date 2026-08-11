import { Column } from 'typeorm'

export class TerritorialLocation {
  @Column({ name: 'department_code', length: 2 })
  departmentCode: string

  @Column({ name: 'department_name', length: 100 })
  departmentName: string

  @Column({ name: 'municipality_code', length: 5 })
  municipalityCode: string

  @Column({ name: 'municipality_name', length: 120 })
  municipalityName: string

  @Column({ name: 'locality', length: 160, nullable: true })
  locality?: string
}
