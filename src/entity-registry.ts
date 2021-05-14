export class EntityRegistry {
  private entityIdCounter: number = 0;
  private deletedEntities: number[] = [];
  private recycleableEntities: number[] = [];

  private entityDeleteListeners: ((entityId: number) => void)[] = [];

  public createEntity(): number {
    if (this.recycleableEntities.length !== 0) {
      return this.recycleableEntities.pop()!;
    }
    return this.entityIdCounter++;
  }

  public deleteEntity(entity: number): void {
    this.deletedEntities.push(entity);
  }

  public onEntityDelete(callback: (entity: number) => void): void {
    this.entityDeleteListeners.push(callback);
  }

  public update(): void {
    while (this.deletedEntities.length !== 0) {
      const entity = this.deletedEntities.pop()!;
      try {
        this.entityDeleteListeners.forEach(listener => listener(entity));
      } finally {
        this.recycleableEntities.push(entity);
      }
    }
  }
}
