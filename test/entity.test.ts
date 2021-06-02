import { ComponentSetBuilder, Entity, EntitySystem, WorldBuilder } from '../src';

test('entity test', () => {
  const world = new WorldBuilder().with(new TestSystem()).build();
  const entity = new Entity(world, world.createEntityId());
  const testComponentA = new TestComponentA();
  testComponentA.name = 'test';
  entity.addComponent(testComponentA);
  world.update(1);
  expect(entity.getComponent<TestComponentA>(TestComponentA).name).toEqual('test');
  entity.removeComponent(TestComponentA);
  world.update(2);
  expect(entity.getComponent(TestComponentA)).toBeUndefined();
});

class TestComponentA {
  name!: string;
}

class TestSystem extends EntitySystem {
  initComponentSet(componentSetBuilder: ComponentSetBuilder): ComponentSetBuilder {
    return componentSetBuilder.containingAll(TestComponentA);
  }

  onInit(): void {}

  onUpdate(dt: number): void {
    if (dt === 1) {
      expect(this.getEntityIds().length).toEqual(1);
    } else if (dt === 2) {
      expect(this.getEntityIds().length).toEqual(0);
    } else {
      fail();
    }
  }
}
