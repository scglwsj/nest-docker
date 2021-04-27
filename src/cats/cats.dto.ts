import { IsString } from 'class-validator';

export class CatDto {
  @IsString()
  name: string;
}
