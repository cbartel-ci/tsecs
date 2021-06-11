import { Component } from './component';
import { ComponentSet } from './component-set';
import { ComponentMapperImpl } from './component-mapper';

export interface Blueprint {
  name: string;
  components: Array<BlueprintComponentDefinition>;
}

export interface BlueprintComponentDefinition {
  type: typeof Component;
  component?: Component;
}

export interface BlueprintComponentConfiguration {
  componentSets: Array<ComponentSet>;
  componentMapperConfigurations: Array<BlueprintComponentMapperConfiguration>;
}

export interface BlueprintComponentMapperConfiguration {
  componentType: typeof Component;
  component: Component | undefined;
  mapper: ComponentMapperImpl<any>;
}
