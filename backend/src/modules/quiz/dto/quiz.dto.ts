import { IsString, IsBoolean, IsOptional, IsInt, Min, ValidateNested, ArrayMinSize, IsArray, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class QuizQuestionOptionDto {
  @IsString()
  text: string;

  @IsBoolean()
  correct: boolean;
}

export class QuizQuestionDto {
  @IsString()
  enonce: string;

  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => QuizQuestionOptionDto)
  options: QuizQuestionOptionDto[];
}

export class CreateQuizDto {
  @IsString()
  titre: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  dureeMinutes?: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => QuizQuestionDto)
  questions: QuizQuestionDto[];
}

export class SubmitQuizDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => QuizSubmissionDto)
  reponses: QuizSubmissionDto[];
}

export class QuizSubmissionDto {
  @IsUUID()
  questionId: string;

  @IsInt()
  @Min(0)
  selectedIndex: number;
}

export class UpdateQuizDto {
  @IsOptional()
  @IsString()
  titre?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  dureeMinutes?: number;
}
