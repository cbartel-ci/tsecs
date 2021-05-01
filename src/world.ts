import {
  EntityRegistry,
  SystemRegistry,
  ComponentRegistry,
  ComponentMapper,
  Component,
  System,
} from './';

export class World {
  constructor(
    private readonly entityRegistry: EntityRegistry,
    private readonly systemRegistry: SystemRegistry,
    private readonly componentRegistry: ComponentRegistry
  ) {}

  public update(dt: number): void {
    this.componentRegistry.update();
    this.systemRegistry.update(dt);
  }

  public getEntityRegistry(): EntityRegistry {
    return this.entityRegistry;
  }

  public getSystemRegistry(): SystemRegistry {
    return this.systemRegistry;
  }

  public getComponentRegistry(): ComponentRegistry {
    return this.componentRegistry;
  }

  createEntity(): number {
    return this.entityRegistry.createEntity();
  }

  getComponentMapper<T extends Component>(
    component: typeof Component
  ): ComponentMapper<T> {
    return this.componentRegistry.getComponentMapper(component);
  }
}

export class WorldBuilder {
  private readonly systems: Array<System> = [];

  public build(): World {
    const entityRegistry = new EntityRegistry();
    const systemRegistry = new SystemRegistry(this.systems);
    const componentRegistry = new ComponentRegistry();

    const world = new World(entityRegistry, systemRegistry, componentRegistry);

    this.systems.forEach(system => system._init(world));
    this.systems.forEach(system => system.onInit());

    return world;
  }

  public with(...systems: System[]): WorldBuilder {
    this.systems.push(...systems);
    return this;
  }
}