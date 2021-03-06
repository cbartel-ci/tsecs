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
  ComponentType,
  EventRegistry,
  EventType,
  EventListener,
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
    private readonly blueprintRegistry: BlueprintRegistry,
    private readonly eventRegistry: EventRegistry
  ) {}

  public update(dt: number): void {
    this.entityRegistry.update();
    this.componentRegistry.update();
    this.eventRegistry.update();
    this.systemRegistry.update(dt);
  }

  public getEntityRegistry(): EntityRegistry {
    return this.entityRegistry;
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

  public getEntity(alias: string): Entity;
  public getEntity(entityId: number): Entity;
  public getEntity(entityIdOrAlias: number | string): Entity {
    return typeof entityIdOrAlias === 'number'
      ? this.entityRegistry.getEntity(entityIdOrAlias as number)
      : this.entityRegistry.getEntityByAlias(entityIdOrAlias as string);
  }

  public createEntity(): Entity;
  public createEntity(blueprint: string): Entity;
  public createEntity(blueprint?: string): Entity {
    const entity = this.getEntity(this.createEntityId());
    if (blueprint) {
      this.blueprintRegistry.applyBlueprint(entity.getEntityId(), blueprint);
    }
    return entity;
  }

  public getComponentMapper<T extends Component>(component: ComponentType<T>): ComponentMapper<T> {
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

  public registerAlias(entityId: number, name: string) {
    this.entityRegistry.registerAlias(entityId, name);
  }

  public registerListener<T extends Event>(eventType: EventType<T>, listener: EventListener<T>) {
    this.eventRegistry.registerListener(eventType, listener);
  }

  public submit<T extends Event>(eventType: EventType<T>, event: T) {
    this.eventRegistry.submit(eventType, event);
  }
}

export class WorldBuilder {
  private readonly systems: Array<System> = [];

  public build(): World {
    const entityRegistry = new EntityRegistry();
    const systemRegistry = new SystemRegistry(this.systems);
    const componentRegistry = new ComponentRegistry();
    const blueprintRegistry = new BlueprintRegistry();
    const eventRegistry = new EventRegistry();

    entityRegistry.onEntityDelete(entity => componentRegistry.processEntityDelete(entity));

    const world = new World(entityRegistry, systemRegistry, componentRegistry, blueprintRegistry, eventRegistry);

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
