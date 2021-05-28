import { Component } from '.';

export const Mapper = function(componentType: typeof Component) {
  return function(prototype: any, key: string) {
    let componentMapper = prototype['__componentMappers'] || {};
    componentMapper[key] = componentType;
    prototype['__componentMappers'] = componentMapper;
  };
};
