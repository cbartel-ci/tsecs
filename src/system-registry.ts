import { System } from './';

export class SystemRegistry {
  constructor(private readonly systems: System[]) {}

  public update(dt: number): void {
    for (const system of this.systems) {
      system._update(dt);
    }
  }
}
