import { World } from './world';
import { Component } from './component';

export class Entity {
  private readonly entityId: number;
  private readonly world: World;

  constructor(world: World, entityId: number) {
    this.world = world;
    this.entityId = entityId;
  }

  public getEntityId(): number {
    return this.entityId;
  }

  public getWorld(): World {
    return this.world;
  }

  public addComponent(...components: Component[]): Entity {
    components.forEach(component => {
      const componentType = Object.getPrototypeOf(component).constructor;
      this.world.getComponentMapper(componentType).addComponent(this.entityId, component);
    });
    return this;
  }

  public getComponent<T extends Component>(componentType: typeof Component): T {
    return this.world.getComponentMapper(componentType).getComponent(this.entityId) as T;
  }

  public removeComponent(...componentTypes: typeof Component[]): Entity {
    componentTypes.forEach(componentType => {
      this.world.getComponentMapper(componentType).removeComponent(this.entityId);
    });
    return this;
  }

  public delete() {
    this.world.getEntityRegistry().deleteEntityById(this.entityId);
  }

  public setAlias(alias: string): Entity {
    this.getWorld().registerAlias(this.entityId, alias);
    return this;
  }
}

export class EntityFactory {
  private readonly world: World;

  constructor(world: World) {
    this.world = world;
  }

  public build(entityId: number) {
    return new Entity(this.world, entityId);
  }
}
