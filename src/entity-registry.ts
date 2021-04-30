export class EntityRegistry {
  private entityIdCounter: number = 0;

  public createEntity(): number {
    return this.entityIdCounter++;
  }
}
