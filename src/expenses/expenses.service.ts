import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Expense } from './expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Budget, BudgetStatus } from '../budgets/budget.entity';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private expensesRepository: Repository<Expense>,
    @InjectRepository(Budget)
    private budgetsRepository: Repository<Budget>,
  ) {}

  async create(createExpenseDto: CreateExpenseDto): Promise<Expense> {
    // Crear el gasto
    const expense = this.expensesRepository.create({
      ...createExpenseDto,
      expenseDate: new Date(createExpenseDto.expenseDate),
    });
    const savedExpense = await this.expensesRepository.save(expense);

    // Buscar presupuesto activo que coincida con la categoría y fecha
    const budget = await this.budgetsRepository.findOne({
      where: {
        userId: createExpenseDto.userId,
        category: createExpenseDto.category,
        status: BudgetStatus.ACTIVE,
        startDate: LessThanOrEqual(new Date(createExpenseDto.expenseDate)),
        endDate: MoreThanOrEqual(new Date(createExpenseDto.expenseDate)),
      },
    });

    if (budget) {
      // Actualizar spentAmount
      budget.spentAmount = Number(budget.spentAmount) + createExpenseDto.amount;

      // Cambiar estado si se excede
      if (budget.spentAmount >= Number(budget.budgetAmount)) {
        budget.status = BudgetStatus.EXCEEDED;
      }

      await this.budgetsRepository.save(budget);
    }

    return savedExpense;
  }

  async findAll(): Promise<Expense[]> {
    return this.expensesRepository.find({
      relations: ['user'],
      order: { expenseDate: 'DESC' },
    });
  }

  async findByUser(userId: number): Promise<Expense[]> {
    return this.expensesRepository.find({
      where: { userId },
      relations: ['user'],
      order: { expenseDate: 'DESC' },
    });
  }

  async findByCategory(category: string): Promise<Expense[]> {
    return this.expensesRepository.find({
      where: { category },
      relations: ['user'],
      order: { expenseDate: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Expense> {
    const expense = await this.expensesRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }

    return expense;
  }

  async update(id: number, updateExpenseDto: UpdateExpenseDto): Promise<Expense> {
    const expense = await this.findOne(id);

    if (updateExpenseDto.expenseDate) {
      updateExpenseDto.expenseDate = new Date(updateExpenseDto.expenseDate) as any;
    }

    Object.assign(expense, updateExpenseDto);
    return this.expensesRepository.save(expense);
  }

  async remove(id: number): Promise<void> {
    const expense = await this.findOne(id);
    await this.expensesRepository.remove(expense);
  }

  async getTotalByUser(userId: number): Promise<number> {
    const result = await this.expensesRepository
      .createQueryBuilder('expense')
      .select('SUM(expense.amount)', 'total')
      .where('expense.userId = :userId', { userId })
      .getRawOne();

    return parseFloat(result.total) || 0;
  }

  async getTotalByUserAndCategory(userId: number, category: string): Promise<number> {
    const result = await this.expensesRepository
      .createQueryBuilder('expense')
      .select('SUM(expense.amount)', 'total')
      .where('expense.userId = :userId AND expense.category = :category', {
        userId,
        category,
      })
      .getRawOne();

    return parseFloat(result.total) || 0;
  }
}
 