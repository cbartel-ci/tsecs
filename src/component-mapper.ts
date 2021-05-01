import { Component } from './';

export class ComponentMapper<T extends Component> {
  private readonly components: { [entityId: number]: T } = {};

  constructor(
    private readonly addComponentCallback: (entityId: number) => void,
    private readonly removeComponentCallback: (entityId: number) => void
  ) {}

  addComponent(entityId: number, component: T): void {
    this.components[entityId] = component;
    this.addComponentCallback(entityId);
  }

  removeComponent(entityId: number): void {
    this.removeComponentCallback(entityId);
    delete this.components[entityId];
  }

  getComponent(entityId: number): T {
    return this.components[entityId];
  }
}
