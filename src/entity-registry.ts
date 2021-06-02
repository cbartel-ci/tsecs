import { Entity, EntityFactory } from './entity';

export class EntityRegistry {
  private entityIdCounter: number = 0;
  private deletedEntities: number[] = [];
  private recycleableEntities: number[] = [];
  private entities: { [entityId: number]: Entity } = {};
  private entityFactory!: EntityFactory;
  private entityDeleteListeners: ((entityId: number) => void)[] = [];

  public setEntityFactory(entityFactory: EntityFactory) {
    this.entityFactory = entityFactory;
  }

  public createEntityId(): number {
    if (this.recycleableEntities.length !== 0) {
      return this.recycleableEntities.pop()!;
    }
    return this.entityIdCounter++;
  }

  public deleteEntityById(entityId: number): void {
    this.deletedEntities.push(entityId);
  }

  public onEntityDelete(callback: (entityId: number) => void): void {
    this.entityDeleteListeners.push(callback);
  }

  public getEntity(entityId: number): Entity {
    let entity = this.entities[entityId];
    if (entity) {
      return entity;
    }
    entity = this.entityFactory.build(entityId);
    this.entities[entityId] = entity;
    return entity;
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
