export class Cat {
  constructor(readonly id: string, public name: string) {}

  update(name: string) {
    this.name = name;
  }
}
