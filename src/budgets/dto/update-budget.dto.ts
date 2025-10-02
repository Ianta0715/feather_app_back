import { PartialType } from '@nestjs/mapped-types';
import { CreateBudgetDto } from './create-budget.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { BudgetStatus } from '../budget.entity';

export class UpdateBudgetDto extends PartialType(CreateBudgetDto) {
  @IsOptional()
  @IsEnum(BudgetStatus)
  status?: BudgetStatus;
}
