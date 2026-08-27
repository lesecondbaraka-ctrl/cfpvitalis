import { IsArray, IsInt, IsNotEmpty, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class QuizReponseItemDto {
  @IsUUID()
  @IsNotEmpty()
  questionId: string;

  @IsInt()
  selectedIndex: number;
}

export class SubmitApprenantQuizDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizReponseItemDto)
  reponses: QuizReponseItemDto[];
}
