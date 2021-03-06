import { BitVector, ComponentType } from './';

export class ComponentSet {
  private activeEntities: number[] = [];

  private readonly entities = new BitVector();
  private readonly entityAddListeners: ((entityId: number) => void)[] = [];
  private readonly entityRemoveListeners: ((entityId: number) => void)[] = [];
  private readonly entitiesAdded = new BitVector();
  private readonly entitiesRemoved = new BitVector();

  private modified: boolean = false;

  constructor(
    private readonly all: BitVector | null,
    private readonly any: BitVector | null,
    private readonly none: BitVector | null
  ) {}

  public onEntityAdd(callback: (entityId: number) => void) {
    this.entityAddListeners.push(callback);
  }

  public onEntityRemove(callback: (entityId: number) => void) {
    this.entityRemoveListeners.push(callback);
  }

  public onCompositionChange(entityId: number, entityComposition: BitVector, entityDelete = false) {
    if (this.isInterested(entityComposition) && !entityDelete) {
      if (this.entities.get(entityId)) {
        return;
      }
      this.entities.set(entityId);
      this.entitiesAdded.set(entityId);
      this.entitiesRemoved.clear(entityId);
      this.modified = true;
    } else if (this.entities.get(entityId)) {
      this.entities.clear(entityId);
      this.entitiesRemoved.set(entityId);
      this.entitiesAdded.clear(entityId);
      this.modified = true;
    }
  }

  public add(entityId: number) {
    this.entities.set(entityId);
    this.entitiesAdded.set(entityId);
    this.modified = true;
  }

  public isInterested(entityComposition: BitVector) {
    if (this.all && !entityComposition.containsAll(this.all)) {
      return false;
    }
    if (this.none && !entityComposition.containsNone(this.none)) {
      return false;
    }
    return !(this.any && !entityComposition.containsAny(this.any));
  }

  public processModifications() {
    if (this.modified) {
      this.activeEntities = this.entities.getBits();
      this.entitiesAdded.getBits().forEach(entity => this.entityAddListeners.forEach(listener => listener(entity)));
      this.entitiesAdded.reset();
      this.entitiesRemoved
        .getBits()
        .forEach(entity => this.entityRemoveListeners.forEach(listener => listener(entity)));
      this.entitiesRemoved.reset();
    }
    this.modified = false;
  }

  public getActiveEntities(): number[] {
    return this.activeEntities;
  }
}

export class ComponentSetBuilder {
  private readonly all: Array<ComponentType<any>> = [];
  private readonly any: Array<ComponentType<any>> = [];
  private readonly none: Array<ComponentType<any>> = [];

  public containingAll(...components: Array<ComponentType<any>>): ComponentSetBuilder {
    this.all.push(...components);
    return this;
  }

  public containingAny(...components: Array<ComponentType<any>>): ComponentSetBuilder {
    this.any.push(...components);
    return this;
  }

  public containingNone(...components: Array<ComponentType<any>>): ComponentSetBuilder {
    this.none.push(...components);
    return this;
  }

  public build(capacity: number, resolveComponentId: (component: ComponentType<any>) => number): ComponentSet {
    let allVector: BitVector | null = null;
    let anyVector: BitVector | null = null;
    let noneVector: BitVector | null = null;
    if (this.all.length > 0) {
      allVector = new BitVector(capacity);
      for (const component of this.all) {
        allVector.set(resolveComponentId(component));
      }
    }
    if (this.any.length > 0) {
      anyVector = new BitVector(capacity);
      for (const component of this.any) {
        anyVector.set(resolveComponentId(component));
      }
    }
    if (this.none.length > 0) {
      noneVector = new BitVector(capacity);
      for (const component of this.none) {
        noneVector.set(resolveComponentId(component));
      }
    }
    return new ComponentSet(allVector, anyVector, noneVector);
  }
}
