import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Cat } from './cats';
import { ICatsDa } from './cats.da.interface';

@Injectable()
export class CatsService {
  constructor(@Inject('catsDa') private readonly catsDa: ICatsDa) {}

  async create(cat: Cat): Promise<void> {
    await this.catsDa.create(cat);
  }

  findAll(): Promise<Cat[]> {
    return this.catsDa.findAll();
  }

  async findOne(id: string): Promise<Cat> {
    const cat = await this.catsDa.findOne(id);
    if (!cat) {
      throw new NotFoundException(`cat ${id} not found!`);
    }

    return cat;
  }

  async update(id: string, name: string) {
    const cat = await this.catsDa.findOne(id);
    if (!cat) {
      throw new NotFoundException(`cat ${id} not found!`);
    }

    cat.update(name);
    await this.catsDa.save(id, cat);
  }
}
