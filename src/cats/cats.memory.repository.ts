import { Injectable } from '@nestjs/common';
import { ICatsDa } from './cats.da.interface';
import { Cat } from './cats';

@Injectable()
export class CatsMemoryRepository implements ICatsDa {
  private readonly cats: Cat[];

  constructor() {
    this.cats = [];
  }

  async save(id: string, cat: Cat): Promise<void> {
    const index = this.cats.findIndex((it) => it.id === id);
    this.cats[index] = cat;
  }

  async create(cat: Cat): Promise<void> {
    this.cats.push(cat);
  }

  async findOne(id: string): Promise<void | Cat> {
    return this.cats.find((cat) => cat.id === id);
  }

  async findAll(): Promise<Cat[]> {
    return this.cats;
  }
}
