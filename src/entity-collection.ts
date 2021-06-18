import { Entity } from './entity';
import { World } from './world';

export abstract class AbstractEntityCollection<T> {
  protected readonly entityIds: number[];

  constructor(entityIds: number[]) {
    this.entityIds = entityIds;
  }

  protected abstract mapEntityId(entityId: number): T;

  public forEach(callback: (entity: T) => void) {
    this.entityIds.forEach(entityId => {
      callback(this.mapEntityId(entityId));
    });
  }
}

export class EntityCollection extends AbstractEntityCollection<Entity> {
  protected readonly world: World;

  constructor(entityIds: number[], world: World) {
    super(entityIds);
    this.world = world;
  }

  protected mapEntityId(entityId: number): Entity {
    return this.world.getEntity(entityId);
  }
}
