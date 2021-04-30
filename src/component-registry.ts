import {
  ComponentSet,
  BitVector,
  Component,
  ComponentMapper,
  ComponentSetBuilder,
} from './';

export class ComponentRegistry {
  private readonly componentIdentityMap: Map<typeof Component, number>;
  private readonly entityCompositionMap: { [entityId: number]: BitVector };
  private readonly componentMapperMap: {
    [entityId: number]: ComponentMapper<any>;
  };
  private readonly componentSets: Array<ComponentSet>;
  private componentIdCounter: number;

  constructor() {
    this.componentIdentityMap = new Map<typeof Component, number>();
    this.entityCompositionMap = {};
    this.componentMapperMap = {};
    this.componentSets = [];
    this.componentIdCounter = 0;
  }

  public update(): void {
    for (const componentSet of this.componentSets) {
      componentSet.processModifications();
    }
  }

  public getComponentId(component: typeof Component): number {
    let id = this.componentIdentityMap.get(component);
    if (id == null) {
      id = this.componentIdCounter++;
      this.componentIdentityMap.set(component, id);
    }
    return id;
  }

  public createComponentSet(
    componentSetBuilder: ComponentSetBuilder
  ): ComponentSet {
    let componentSet = componentSetBuilder.build(component =>
      this.getComponentId(component)
    );
    this.componentSets.push(componentSet);
    return componentSet;
  }

  public getComponentMapper<T extends Component>(
    component: typeof Component
  ): ComponentMapper<T> {
    const componentId = this.getComponentId(component);
    if (!this.componentMapperMap[componentId]) {
      this.componentMapperMap[componentId] = this.createComponentMapper(
        componentId
      );
    }
    return this.componentMapperMap[componentId];
  }

  private getEntityComposition(entityId: number): BitVector {
    if (!this.entityCompositionMap[entityId]) {
      this.entityCompositionMap[entityId] = new BitVector();
    }
    return this.entityCompositionMap[entityId];
  }

  private createComponentMapper(componentId: number): ComponentMapper<any> {
    return new ComponentMapper(
      (entityId: number) => {
        const composition = this.getEntityComposition(entityId);
        composition.set(componentId);
        for (const componentSet of this.componentSets) {
          componentSet.onCompositionChange(entityId, composition);
        }
      },
      (entityId: number) => {
        const composition = this.getEntityComposition(entityId);
        composition.clear(componentId);
        for (const componentSet of this.componentSets) {
          componentSet.onCompositionChange(entityId, composition);
        }
      }
    );
  }
}
