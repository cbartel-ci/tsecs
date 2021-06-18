import { Component, ComponentType } from './component';
import { ComponentSet } from './component-set';
import { ComponentMapperImpl } from './component-mapper';

export interface Blueprint {
  name: string;
  components: Array<BlueprintComponentDefinition>;
}

export interface BlueprintComponentDefinition {
  type: ComponentType<any>;
  component?: Component;
}

export interface BlueprintComponentConfiguration {
  componentSets: Array<ComponentSet>;
  componentMapperConfigurations: Array<BlueprintComponentMapperConfiguration>;
}

export interface BlueprintComponentMapperConfiguration {
  componentType: ComponentType<any>;
  component: Component | undefined;
  mapper: ComponentMapperImpl<any>;
}
