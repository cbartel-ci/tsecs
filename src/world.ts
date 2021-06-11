import {
  EntityRegistry,
  SystemRegistry,
  ComponentRegistry,
  ComponentMapper,
  Component,
  System,
  Entity,
  EntityFactory,
  Blueprint,
} from './';
import { BlueprintRegistry } from './blueprint-registry';

export class World {
  public static builder(): WorldBuilder {
    return new WorldBuilder();
  }

  constructor(
    private readonly entityRegistry: EntityRegistry,
    private readonly systemRegistry: SystemRegistry,
    private readonly componentRegistry: ComponentRegistry,
    private readonly blueprintRegistry: BlueprintRegistry
  ) {}

  public update(dt: number): void {
    this.entityRegistry.update();
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

  public createEntityId(): number {
    return this.entityRegistry.createEntityId();
  }

  public deleteEntityById(entity: number): void {
    this.entityRegistry.deleteEntityById(entity);
  }

  public getEntity(entityId: number): Entity {
    return this.entityRegistry.getEntity(entityId);
  }

  public createEntity(blueprint?: string): Entity {
    const entity = this.getEntity(this.createEntityId());
    if (blueprint) {
      this.blueprintRegistry.applyBlueprint(entity.getEntityId(), blueprint);
    }
    return entity;
  }

  public getComponentMapper<T extends Component>(component: typeof Component): ComponentMapper<T> {
    return this.componentRegistry.getComponentMapper(component);
  }

  public injectComponentMappers(object: any) {
    const proto = Object.getPrototypeOf(object);
    const componentMappers = proto.__componentMappers || {};
    Object.keys(componentMappers).forEach((key: any) => {
      const componentType = componentMappers[key];
      object[key] = this.getComponentMapper(componentType);
    });
  }

  public registerBlueprint(blueprint: Blueprint) {
    const blueprintConfiguration = this.componentRegistry.getBlueprintConfiguration(blueprint);
    this.blueprintRegistry.registerBlueprint(blueprint.name, blueprintConfiguration);
  }
}

export class WorldBuilder {
  private readonly systems: Array<System> = [];

  public build(): World {
    const entityRegistry = new EntityRegistry();
    const systemRegistry = new SystemRegistry(this.systems);
    const componentRegistry = new ComponentRegistry();
    const blueprintRegistry = new BlueprintRegistry();

    entityRegistry.onEntityDelete(entity => componentRegistry.processEntityDelete(entity));

    const world = new World(entityRegistry, systemRegistry, componentRegistry, blueprintRegistry);

    this.systems.forEach((system: any) => {
      world.injectComponentMappers(system);
    });

    entityRegistry.setEntityFactory(new EntityFactory(world));

    this.systems.forEach(system => system._init(world));
    this.systems.forEach(system => system.onInit());

    return world;
  }

  public with(...systems: System[]): WorldBuilder {
    this.systems.push(...systems);
    return this;
  }
}
