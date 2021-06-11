import { BlueprintComponentConfiguration } from './blueprint';

export class BlueprintRegistry {
  private readonly blueprintMap: { [blueprintName: string]: BlueprintComponentConfiguration };

  constructor() {
    this.blueprintMap = {};
  }

  public registerBlueprint(blueprintName: string, configuration: BlueprintComponentConfiguration) {
    this.blueprintMap[blueprintName] = configuration;
  }

  public applyBlueprint(entityId: number, blueprintName: string) {
    const configuration = this.blueprintMap[blueprintName];
    configuration.componentSets.forEach(componentSet => componentSet.add(entityId));
    configuration.componentMapperConfigurations.forEach(it => {
      const component = new it.componentType();
      Object.assign(component, it.component);
      it.mapper.addComponent(entityId, component, true);
    });
  }
}
