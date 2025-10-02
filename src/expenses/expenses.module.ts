// expenses.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { Expense } from './expense.entity';
import { Budget } from '../budgets/budget.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Expense, Budget])],
  controllers: [ExpensesController],
  providers: [ExpensesService],
})
export class ExpensesModule {}
