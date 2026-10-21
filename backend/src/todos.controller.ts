import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsBoolean, IsString, Length } from 'class-validator';
import { TodosService } from './todos.service';

class CreateTodoDto {
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @Length(1, 200)
  title!: string;
}

class UpdateTodoDto {
  @IsBoolean()
  completed!: boolean;
}

@Controller('todos')
export class TodosController {
  constructor(private readonly todos: TodosService) {}

  @Get()
  list() {
    return this.todos.list();
  }

  @Post()
  create(@Body() body: CreateTodoDto) {
    return this.todos.create(body.title);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateTodoDto) {
    return this.todos.update(id, body.completed);
  }

  @Patch(':id/title')
  rename(@Param('id', ParseIntPipe) id: number, @Body() body: CreateTodoDto) {
    return this.todos.rename(id, body.title);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.todos.remove(id);
  }
}
