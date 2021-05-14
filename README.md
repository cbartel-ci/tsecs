# TSECS

This is an entity component system (ecs) written in typescript.

## Usage

This project aims to give you an easy approach to write your applications. Here is an example on how to use tsecs:

Create your components:
```typescript
export class MoveComponent {
    v: number = 1;
    dir: number = 1;
}

export class TransformComponent {
    x! : number;
    y! : number;
}
```

Create your systems:
```typescript
export class MoveSystem extends EntitySystem {

    private transformComponentMapper! : ComponentMapper<TransformComponent>;
    private moveComponentMapper! : ComponentMapper<MoveComponent>;


    initComponentSet(componentSetBuilder: ComponentSetBuilder): ComponentSetBuilder {
        return componentSetBuilder.containingAll(TransformComponent, MoveComponent);
    }

    onInit(): void {
        this.transformComponentMapper = this.getWorld().getComponentMapper(TransformComponent);
        this.moveComponentMapper = this.getWorld().getComponentMapper(MoveComponent);
    }

    onUpdate(dt: number): void {
        this.getEntities().forEach((entity) => {
            const transformComponent = this.transformComponentMapper.getComponent(entity);
            const moveComponent = this.moveComponentMapper.getComponent(entity);
            if(transformComponent.x >= 400) {
                moveComponent.dir = -1;
            }
            if(transformComponent.x <= 10) {
                moveComponent.dir = 1;
            }
            transformComponent.x += dt*moveComponent.dir*moveComponent.v;
        })
    }

    onEntityAdd(entity: number): void {
        console.log(`entity ${entity} was added to the move system`);
    }

    onEntityRemove(entity: number): void {
        console.log(`entity ${entity} was removed from the move system`);
    }

}
```

And now create your world:
```typescript
const world = new WorldBuilder().with(new MoveSystem()).build();
```

Now you only need to call the update method periodically and you're good to go:
```typescript
setInterval(() => world.update(1000), 1000);
```

## This Project is using TSDX

Code quality is set up with `prettier`, `husky`, and `lint-staged` using the defaults of [TSDX](https://tsdx.io/).

### Jest

Jest tests are set up to run with `npm test` or `yarn test`.

### Rollup

TSDX uses [Rollup](https://rollupjs.org) as a bundler and generates multiple rollup configs for various module formats and build settings. See [Optimizations](#optimizations) for details.

## Publishing to NPM

TSDX recommends using [np](https://github.com/sindresorhus/np).
