import { BitVector, Component } from './';

export class ComponentSet {
  private activeEntities: number[] = [];

  private readonly entities: BitVector = new BitVector();
  private readonly entityAddListeners: ((entityId: number) => void)[] = [];
  private readonly entityRemoveListeners: ((entityId: number) => void)[] = [];

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

  public onCompositionChange(entityId: number, entityComposition: BitVector) {
    if (this.isInterested(entityComposition)) {
      this.entities.set(entityId);
      this.entityAddListeners.forEach(it => it(entityId));
      this.modified = true;
    } else if (this.entities.get(entityId)) {
      this.entities.clear(entityId);
      this.entityRemoveListeners.forEach(it => it(entityId));
      this.modified = true;
    }
  }

  private isInterested(entityComposition: BitVector) {
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
    }
    this.modified = false;
  }

  public getActiveEntities(): number[] {
    return this.activeEntities;
  }
}

export class ComponentSetBuilder {
  private readonly all: Array<typeof Component> = [];
  private readonly any: Array<typeof Component> = [];
  private readonly none: Array<typeof Component> = [];

  public containingAll(
    ...components: Array<typeof Component>
  ): ComponentSetBuilder {
    this.all.push(...components);
    return this;
  }

  public containingAny(
    ...components: Array<typeof Component>
  ): ComponentSetBuilder {
    this.any.push(...components);
    return this;
  }

  public containingNone(
    ...components: Array<typeof Component>
  ): ComponentSetBuilder {
    this.none.push(...components);
    return this;
  }

  public build(
    resolveComponentId: (component: typeof Component) => number
  ): ComponentSet {
    let allVector: BitVector | null = null;
    let anyVector: BitVector | null = null;
    let noneVector: BitVector | null = null;
    if (this.all.length > 0) {
      allVector = new BitVector();
      for (const component of this.all) {
        allVector.set(resolveComponentId(component));
      }
    }
    if (this.any.length > 0) {
      anyVector = new BitVector();
      for (const component of this.any) {
        anyVector.set(resolveComponentId(component));
      }
    }
    if (this.none.length > 0) {
      noneVector = new BitVector();
      for (const component of this.none) {
        noneVector.set(resolveComponentId(component));
      }
    }
    return new ComponentSet(allVector, anyVector, noneVector);
  }
}
