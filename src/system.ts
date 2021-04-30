import { ComponentSet, ComponentSetBuilder, World } from './';

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

export abstract class EntitySystem extends System {
  private _componentSet!: ComponentSet;

  _init(world: World) {
    let componentSetBuilder = this.initComponentSet(new ComponentSetBuilder());
    this._componentSet = world
      .getComponentRegistry()
      .createComponentSet(componentSetBuilder);
    super._init(world);
  }

  public getEntities(): number[] {
    return this._componentSet.getActiveEntities();
  }

  abstract initComponentSet(
    componentSetBuilder: ComponentSetBuilder
  ): ComponentSetBuilder;
}
