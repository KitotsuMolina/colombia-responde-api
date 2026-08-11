import { Type } from 'class-transformer'
import { IsIn, IsInt, IsLatitude, IsLongitude, IsOptional, IsString, Length, Max, Min, ValidateNested } from 'class-validator'

class LocationDto {
  @IsOptional() @IsString() @Length(2, 2) departmentCode?: string
  @IsString() @Length(2, 100) departmentName: string
  @IsOptional() @IsString() @Length(5, 5) municipalityCode?: string
  @IsString() @Length(2, 120) municipalityName: string
  @IsOptional() @IsString() @Length(2, 160) locality?: string
}

export class CreateIncidentDto {
  @IsIn(['help','damage','landslide','road','water','power','medical','shelter','aid']) kind: string
  @IsString() @Length(3, 160) title: string
  @IsString() @Length(5, 2000) description: string
  @ValidateNested() @Type(() => LocationDto) location: LocationDto
  @IsLongitude() longitude: number
  @IsLatitude() latitude: number
  @IsOptional() @IsInt() @Min(0) @Max(10000) peopleAtRisk?: number
}
