import { Component, ComponentMapper, ComponentSetBuilder, EntitySystem, FastEntitySystem, Mapper, World } from '../src';

const performance = require('perf_hooks').performance;

const updates = 10000;
const iterations = 100;
const warumupIterations = 100;

/**
 * Conclusion: the 'fast' implementations are not that fast as I thought they would be, using entity class wrappers
 * seems to make the API much cleaner and the impact on the performance is minimal.
 */

xtest('Simple Performance Test', () => {
  let world = World.builder()
    .with(new TestSystemA(), new TestSystemB())
    .build();

  for (let i = 0; i < warumupIterations; i++) {
    world.update(0);
  }

  let t = 0;
  for (let i = 0; i < iterations; i++) {
    let t0 = performance.now();
    world.update(0);
    let t1 = performance.now();
    t += t1 - t0;
  }
  t = t / iterations;
  console.log('Entity System: ' + t);

  world = World.builder()
    .with(new FastTestSystemA(), new FastTestSystemB())
    .build();

  for (let i = 0; i < warumupIterations; i++) {
    world.update(0);
  }

  t = 0;
  for (let i = 0; i < iterations; i++) {
    let t0 = performance.now();
    world.update(0);
    let t1 = performance.now();
    t += t1 - t0;
  }
  t = t / iterations;
  console.log('Fast Entity System: ' + t);
});

class TestComponentA extends Component {}
class TestComponentB extends Component {}
class TestComponentC extends Component {}
class TestComponentD extends Component {}

class TestSystemA extends EntitySystem {
  protected initComponentSet(componentSetBuilder: ComponentSetBuilder): ComponentSetBuilder {
    return componentSetBuilder.containingAll(TestComponentA, TestComponentB);
  }

  onInit(): void {
    for (let i = 0; i < updates; i++) {
      this.getWorld()
        .createEntity()
        .addComponent(new TestComponentA(), new TestComponentB());
    }
  }

  onUpdate(dt: number): void {
    this.getEntities().forEach(entity => {
      // entity.removeComponent(TestComponentA, TestComponentB).addComponent(new TestComponentC(), new TestComponentD());
      entity.getComponent(TestComponentA);
      entity.getComponent(TestComponentB);
    });
  }
}

class TestSystemB extends EntitySystem {
  protected initComponentSet(componentSetBuilder: ComponentSetBuilder): ComponentSetBuilder {
    return componentSetBuilder.containingAll(TestComponentC, TestComponentD);
  }

  onInit(): void {
    for (let i = 0; i < updates; i++) {
      this.getWorld()
        .createEntity()
        .addComponent(new TestComponentC(), new TestComponentD());
    }
  }

  onUpdate(dt: number): void {
    this.getEntities().forEach(entity => {
      // entity.removeComponent(TestComponentC, TestComponentD).addComponent(new TestComponentA(), new TestComponentB());
      entity.getComponent(TestComponentC);
      entity.getComponent(TestComponentD);
    });
  }
}

class FastTestSystemA extends FastEntitySystem {
  @Mapper(TestComponentA)
  private a!: ComponentMapper<TestComponentA>;

  @Mapper(TestComponentB)
  private b!: ComponentMapper<TestComponentB>;

  @Mapper(TestComponentC)
  private c!: ComponentMapper<TestComponentC>;

  @Mapper(TestComponentD)
  private d!: ComponentMapper<TestComponentD>;

  protected initComponentSet(componentSetBuilder: ComponentSetBuilder): ComponentSetBuilder {
    return componentSetBuilder.containingAll(TestComponentA, TestComponentB);
  }

  onInit(): void {
    for (let i = 0; i < updates; i++) {
      this.getWorld()
        .createEntity()
        .addComponent(new TestComponentA(), new TestComponentB());
    }
  }

  onUpdate(dt: number): void {
    this.getEntities().forEach(entity => {
      // this.c.addComponent(entity, new TestComponentC());
      // this.d.addComponent(entity, new TestComponentD());
      // this.a.removeComponent(entity);
      // this.b.removeComponent(entity);
      this.a.getComponent(entity);
      this.b.getComponent(entity);
      this.c.getComponent(entity);
      this.d.getComponent(entity);
    });
  }
}

class FastTestSystemB extends FastEntitySystem {
  @Mapper(TestComponentA)
  private a!: ComponentMapper<TestComponentA>;

  @Mapper(TestComponentB)
  private b!: ComponentMapper<TestComponentB>;

  @Mapper(TestComponentC)
  private c!: ComponentMapper<TestComponentC>;

  @Mapper(TestComponentD)
  private d!: ComponentMapper<TestComponentD>;

  protected initComponentSet(componentSetBuilder: ComponentSetBuilder): ComponentSetBuilder {
    return componentSetBuilder.containingAll(TestComponentC, TestComponentD);
  }

  onInit(): void {
    for (let i = 0; i < updates; i++) {
      this.getWorld()
        .createEntity()
        .addComponent(new TestComponentC(), new TestComponentD());
    }
  }

  onUpdate(dt: number): void {
    this.getEntities().forEach(entity => {
      // this.c.removeComponent(entity);
      // this.d.removeComponent(entity);
      // this.a.addComponent(entity, new TestComponentA());
      // this.b.addComponent(entity, new TestComponentB());
      this.a.getComponent(entity);
      this.b.getComponent(entity);
      this.c.getComponent(entity);
      this.d.getComponent(entity);
    });
  }
}
