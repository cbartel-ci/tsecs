import { ComponentSet, ComponentSetBuilder, Entity, World } from './';
import { AbstractEntityCollection, EntityCollection, FastEntityCollection } from './entity-collection';

export abstract class System {
  private _world!: World;

  public _init(world: World): void {
    this._world = world;
  }

  public _update(dt: number): void {
    this.onUpdate(dt);
  }

  public getWorld(): World {
    return this._world;
  }

  abstract onInit(): void;
  abstract onUpdate(dt: number): void;
}

export abstract class AbstractEntitySystem<T> extends System {
  private _componentSet!: ComponentSet;

  _init(world: World) {
    let componentSetBuilder = this.initComponentSet(new ComponentSetBuilder());
    this._componentSet = world.getComponentRegistry().createComponentSet(componentSetBuilder);
    this._componentSet.onEntityAdd(entityId => this.onEntityAdd(this.mapEntityId(entityId)));
    this._componentSet.onEntityRemove(entityId => this.onEntityRemove(this.mapEntityId(entityId)));
    super._init(world);
  }

  public getEntityIds(): number[] {
    return this._componentSet.getActiveEntities();
  }

  public abstract getEntities(): AbstractEntityCollection<T>;

  protected abstract initComponentSet(componentSetBuilder: ComponentSetBuilder): ComponentSetBuilder;

  protected abstract mapEntityId(entityId: number): T;

  onEntityAdd(entity: T): void {}
  onEntityRemove(entity: T): void {}
}

export abstract class FastEntitySystem extends AbstractEntitySystem<number> {
  protected mapEntityId(entityId: number): number {
    return entityId;
  }

  public getEntities(): AbstractEntityCollection<number> {
    return new FastEntityCollection(this.getEntityIds());
  }
}

export abstract class EntitySystem extends AbstractEntitySystem<Entity> {
  protected mapEntityId(entityId: number): Entity {
    return this.getWorld()
      .getEntityRegistry()
      .getEntity(entityId);
  }

  public getEntities(): AbstractEntityCollection<Entity> {
    return new EntityCollection(this.getEntityIds(), this.getWorld());
  }
}
