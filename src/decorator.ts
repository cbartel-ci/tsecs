import { ComponentType } from '.';

export const Mapper = function(componentType: ComponentType<any>) {
  return function(prototype: any, key: string) {
    let componentMapper = prototype['__componentMappers'] || {};
    componentMapper[key] = componentType;
    prototype['__componentMappers'] = componentMapper;
  };
};
