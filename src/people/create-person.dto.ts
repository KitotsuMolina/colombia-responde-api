import { Type } from 'class-transformer'
import { IsDateString, IsInt, IsOptional, IsString, IsUrl, Length, Max, Min, ValidateNested } from 'class-validator'

class PersonLocationDto {
  @IsOptional() @IsString() @Length(2,2) departmentCode?: string
  @IsString() @Length(2,100) departmentName: string
  @IsOptional() @IsString() @Length(5,5) municipalityCode?: string
  @IsString() @Length(2,120) municipalityName: string
  @IsOptional() @IsString() @Length(2,160) locality?: string
}
export class CreatePersonDto {
  @IsString() @Length(3,180) fullName: string
  @IsOptional() @IsInt() @Min(0) @Max(125) age?: number
  @IsOptional() @IsUrl({ protocols:['https'], require_protocol:true }) photoUrl?: string
  @ValidateNested() @Type(() => PersonLocationDto) location: PersonLocationDto
  @IsDateString() lastSeenAt: string
  @IsString() @Length(5,2000) lastSeenDetails: string
  @IsString() @Length(20,120) contactToken: string
}
