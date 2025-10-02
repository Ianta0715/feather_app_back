import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget, BudgetStatus } from './budget.entity';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { User } from 'src/users/user.entity';

@Injectable()
export class BudgetsService {
  constructor(
    @InjectRepository(Budget)
    private budgetsRepository: Repository<Budget>,
  ) {}

  async create(createBudgetDto: CreateBudgetDto): Promise<Budget> {
    // Verificar que el usuario exista
    const user = await this.budgetsRepository.manager.findOne(User, {
      where: { id: createBudgetDto.userId },
    });

    if (!user) {
      throw new NotFoundException(
        `User with ID ${createBudgetDto.userId} not found`,
      );
    }

    const budget = this.budgetsRepository.create({
      name: createBudgetDto.name,
      category: createBudgetDto.category,
      budgetAmount: createBudgetDto.budgetAmount,
      startDate: new Date(createBudgetDto.startDate),
      endDate: new Date(createBudgetDto.endDate),
      description: createBudgetDto.description,
      spentAmount: 0,
      status: BudgetStatus.ACTIVE,
      user, // <- relación correcta
    });

    return this.budgetsRepository.save(budget);
  }

  async findAll(): Promise<Budget[]> {
    return this.budgetsRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByUser(userId: number): Promise<Budget[]> {
    return this.budgetsRepository.find({
      where: { userId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findActiveByUser(userId: number): Promise<Budget[]> {
    return this.budgetsRepository.find({
      where: { userId, status: BudgetStatus.ACTIVE },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByCategory(category: string): Promise<Budget[]> {
    return this.budgetsRepository.find({
      where: { category },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Budget> {
    const budget = await this.budgetsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!budget) {
      throw new NotFoundException(`Budget with ID ${id} not found`);
    }

    return budget;
  }

  async update(id: number, updateBudgetDto: UpdateBudgetDto): Promise<Budget> {
    const budget = await this.findOne(id);

    if (updateBudgetDto.startDate) {
      updateBudgetDto.startDate = new Date(updateBudgetDto.startDate) as any;
    }
    if (updateBudgetDto.endDate) {
      updateBudgetDto.endDate = new Date(updateBudgetDto.endDate) as any;
    }

    Object.assign(budget, updateBudgetDto);
    return this.budgetsRepository.save(budget);
  }

  async remove(id: number): Promise<void> {
    const budget = await this.findOne(id);
    await this.budgetsRepository.remove(budget);
  }

  async updateSpentAmount(id: number, amount: number): Promise<Budget> {
    const budget = await this.findOne(id);
    budget.spentAmount = amount;

    // Actualizar estado basado en el gasto
    if (budget.spentAmount >= budget.budgetAmount) {
      budget.status = BudgetStatus.EXCEEDED;
    } else if (budget.status === BudgetStatus.EXCEEDED) {
      budget.status = BudgetStatus.ACTIVE;
    }

    return this.budgetsRepository.save(budget);
  }

  async getBudgetProgress(id: number): Promise<{
    budget: Budget;
    progress: number;
    remaining: number;
    isExceeded: boolean;
  }> {
    const budget = await this.findOne(id);
    const progress = (budget.spentAmount / budget.budgetAmount) * 100;
    const remaining = budget.budgetAmount - budget.spentAmount;
    const isExceeded = budget.spentAmount > budget.budgetAmount;

    return {
      budget,
      progress: Math.round(progress * 100) / 100,
      remaining: Math.round(remaining * 100) / 100,
      isExceeded,
    };
  }

}
