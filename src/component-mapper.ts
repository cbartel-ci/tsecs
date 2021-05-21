import { BitVector, Component } from './';

export class ComponentMapper<T extends Component> {
  private readonly components: { [entityId: number]: T } = {};
  private readonly cachedDeletions = new BitVector();

  constructor(
    private readonly addComponentCallback: (entityId: number) => void,
    private readonly removeComponentCallback: (
      entityId: number,
      entityDelete: boolean
    ) => void
  ) {}

  addComponent(entityId: number, component: T): void {
    this.components[entityId] = component;
    this.addComponentCallback(entityId);
    this.cachedDeletions.clear(entityId);
  }

  removeComponent(entityId: number, entityDelete = false): void {
    this.removeComponentCallback(entityId, entityDelete);
    this.cachedDeletions.set(entityId);
  }

  processModifications() {
    this.cachedDeletions.getBits().forEach(entity => {
      delete this.components[entity];
    });
    this.cachedDeletions.reset();
  }

  getComponent(entityId: number): T {
    return this.components[entityId];
  }
}
