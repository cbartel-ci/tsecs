import { ComponentSetBuilder, EntitySystem, World } from '../src';

test('entity collection test', () => {
  const world = World.builder()
    .with(new TestSystem())
    .build();

  world.update(1);

  const entity = world.getEntity(0);
  expect(entity.getComponent<TestComponentA>(TestComponentA).name).toEqual('test');
});

class TestComponentA {
  name!: string;
}

class TestSystem extends EntitySystem {
  initComponentSet(componentSetBuilder: ComponentSetBuilder): ComponentSetBuilder {
    return componentSetBuilder.containingAll(TestComponentA);
  }

  onInit(): void {
    this.getWorld()
      .createEntity()
      .addComponent(new TestComponentA());
  }

  onUpdate(dt: number): void {
    this.getEntities().forEach(entity => {
      entity.getComponent<TestComponentA>(TestComponentA).name = 'test';
    });
  }
}
