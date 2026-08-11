import { Type } from 'class-transformer'
import { IsLatitude, IsLongitude, IsOptional, IsString, Length, ValidateNested } from 'class-validator'

class CheckInLocationDto {
  @IsOptional() @IsString() @Length(2,2) departmentCode?: string
  @IsString() @Length(2,100) departmentName: string
  @IsOptional() @IsString() @Length(5,5) municipalityCode?: string
  @IsString() @Length(2,120) municipalityName: string
  @IsOptional() @IsString() @Length(2,160) locality?: string
}
export class CreateSafetyCheckInDto {
  @IsString() @Length(3,180) fullName: string
  @ValidateNested() @Type(() => CheckInLocationDto) location: CheckInLocationDto
  @IsOptional() @IsString() @Length(2,500) message?: string
  @IsOptional() @IsLongitude() longitude?: number
  @IsOptional() @IsLatitude() latitude?: number
}
export class DeleteSafetyCheckInDto { @IsString() @Length(32,128) deleteToken: string }
