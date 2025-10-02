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
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  create(@Body(ValidationPipe) createExpenseDto: CreateExpenseDto) {
    return this.expensesService.create(createExpenseDto);
  }

  @Get()
  findAll(
    @Query('userId') userId?: string,
    @Query('category') category?: string,
  ) {
    if (userId) {
      return this.expensesService.findByUser(parseInt(userId));
    }
    if (category) {
      return this.expensesService.findByCategory(category);
    }
    return this.expensesService.findAll();
  }

  @Get('total/:userId')
  getTotalByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.expensesService.getTotalByUser(userId);
  }

  @Get('total/:userId/category/:category')
  getTotalByUserAndCategory(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('category') category: string,
  ) {
    return this.expensesService.getTotalByUserAndCategory(userId, category);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.expensesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateExpenseDto: UpdateExpenseDto,
  ) {
    return this.expensesService.update(id, updateExpenseDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.expensesService.remove(id);
  }
}
