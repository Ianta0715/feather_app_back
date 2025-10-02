import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  create(@Body(ValidationPipe) createBudgetDto: CreateBudgetDto) {
    return this.budgetsService.create(createBudgetDto);
  }

  @Get()
  findAll(
    @Query('userId') userId?: string,
    @Query('category') category?: string,
    @Query('active') active?: string,
  ) {
    if (userId && active === 'true') {
      return this.budgetsService.findActiveByUser(parseInt(userId));
    }
    if (userId) {
      return this.budgetsService.findByUser(parseInt(userId));
    }
    if (category) {
      return this.budgetsService.findByCategory(category);
    }
    return this.budgetsService.findAll();
  }

  @Get('progress/:id')
  getBudgetProgress(@Param('id', ParseIntPipe) id: number) {
    return this.budgetsService.getBudgetProgress(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.budgetsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateBudgetDto: UpdateBudgetDto,
  ) {
    return this.budgetsService.update(id, updateBudgetDto);
  }

  @Patch(':id/spent/:amount')
  updateSpentAmount(
    @Param('id', ParseIntPipe) id: number,
    @Param('amount', ParseIntPipe) amount: number,
  ) {
    return this.budgetsService.updateSpentAmount(id, amount);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.budgetsService.remove(id);
  }
}
