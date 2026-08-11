import { Type } from 'class-transformer'
import { ArrayMaxSize, ArrayMinSize, IsArray, IsLatitude, IsLongitude, IsOptional, ValidateNested } from 'class-validator'
import { CreateIncidentDto } from '../incidents/create-incident.dto'

export class IncidentAreaPointDto {
  @IsLatitude() latitude: number
  @IsLongitude() longitude: number
}

export class AdminCreateIncidentDto extends CreateIncidentDto {
  @IsOptional()
  @IsArray()
  @ArrayMinSize(3)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => IncidentAreaPointDto)
  area?: IncidentAreaPointDto[]
}
