import { Controller, Get, Post, Body, HttpCode, Param } from '@nestjs/common';
import { CatDto } from './cats.dto';
import { Cat } from './cats';
import { CatsService } from './cats.service';
import { v4 as uuid } from 'uuid';

@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Post()
  @HttpCode(204)
  create(@Body() dto: CatDto) {
    return this.catsService.create(new Cat(uuid(), dto.name));
  }

  @Get()
  findAll() {
    return this.catsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.catsService.findOne(id);
  }
}
