import { nanoid } from "nanoid";

/* ****************************************************************************************************************** */
/*                                               COMPONENT                                                            */
/* ****************************************************************************************************************** */

const factoryIdKey = "factoryId" as const;

export class ComponentFactory<T> {
  public readonly hashId: HashId;
  public readonly [factoryIdKey]: HashId;

  private properties: T;

  constructor(props: T, factoryId: HashId) {
    this.hashId = componentUniqueId();
    this[factoryIdKey] = factoryId;

    this.properties = props;
  }

  get(): T {
    return this.properties;
  }

  set(updatedProps: T) {
    this.properties = updatedProps;
  }
}

export type Component<T> = ComponentFactory<T>;

type ComponentCreator<T> = ((args: T) => ComponentFactory<T>) & {
  readonly [factoryIdKey]: HashId;
};

export const component = <T>(factoryId: string, defaultValues?: Partial<T>) => {
  const fn = (args: T) => {
    return new (class extends ComponentFactory<T> {
      constructor(props: T) {
        super(defaultValue(props, defaultValues), factoryId);
      }
    })(args);
  };

  Object.defineProperty(fn, factoryIdKey, {
    value: factoryId,
    writable: false,
    configurable: false,
  });

  return fn as ComponentCreator<T>;
};

/* ****************************************************************************************************************** */
/*                                                RESOURCE                                                            */
/* ****************************************************************************************************************** */

export class ECSResource<T> {
  readonly name: string;
  private state?: T;

  private subscribers: Array<<T>(updatedState: T) => void> = [];

  constructor(name: string, props?: T) {
    this.name = name;
    this.state = props;
  }

  get() {
    return this.state;
  }

  set(updatedState: T) {
    this.state = updatedState;

    this.subscribers.forEach((fn) => {
      fn(updatedState);
    });
  }

  subscribe(subscriber: <U = T>(updatedState: U) => void) {
    this.subscribers.push(subscriber);
  }
}

// get Constructor Auguments
export type Resource<T> = ECSResource<T>;

export type ResourceRead<T> = Pick<ECSResource<T>, "name">;
export type ResourceMut<T> = ECSResource<T>;

export const resource = <T>(props?: T): ECSResource<T> => {
  const res = new ECSResource<T>(resourceUniqueId(), props);
  return res;
};

/* ****************************************************************************************************************** */
/*                                                SCHEDULE                                                            */
/* ****************************************************************************************************************** */

export interface System {
  query: (
    world: World
  ) => Record<
    string,
    ECSResource<unknown> | undefined | Map<string, Map<string, Component<any>>>
  >;
  execute: (args: ReturnType<this["query"]>) => Promise<void> | void;
}

export class Schedule {
  world: World;

  systems: Array<System> = [];

  constructor(world: World) {
    this.world = world;
  }

  add_system(system: System) {
    this.systems.push(system);
  }

  async run_promise() {
    for (const { query, execute } of this.systems) {
      await execute(query(this.world));
    }
  }

  run() {
    for (const { query, execute } of this.systems) {
      execute(query(this.world));
    }
  }
}

/* ****************************************************************************************************************** */
/*                                             EVENTS SCHEDULE                                                        */
/* ****************************************************************************************************************** */

// TODO: Implement Event Schedule

/* ****************************************************************************************************************** */
/*                                                WORLD                                                               */
/* ****************************************************************************************************************** */

export class World {
  private entities: Map<string, Map<string, Component<unknown>>> = new Map();
  private resources: Map<string, ECSResource<unknown>> = new Map();

  private queryManager = new Query(this);

  spawn(...components: Array<Array<Component<unknown>> | Component<unknown>>) {
    let mapIds: string[] = [];

    components.forEach((component_or_components) => {
      const id = entityUniqueId();
      mapIds.push(id);

      // component map
      const componentMap: Map<string, Component<unknown>> = new Map();

      if (component_or_components instanceof Array) {
        component_or_components.map((c) => {
          componentMap.set(c.factoryId, c);
        });
      } else {
        componentMap.set(
          component_or_components.factoryId,
          component_or_components
        );
      }

      this.addEntity(id, componentMap);
    });

    return mapIds.length === 1 ? mapIds[0] : mapIds.length > 0 ? mapIds : "";
  }

  private addEntity(
    entityId: HashId,
    componentMap: Map<string, Component<unknown>>
  ) {
    this.entities.set(entityId, componentMap);
    this.queryManager.addEntity(entityId, componentMap);
  }

  entity(entityId: string) {
    return this.entities.get(entityId);
  }

  get_all_entities() {
    return this.entities;
  }

  get query(): Pick<Query, "exact" | "have"> {
    return this.queryManager;
  }

  // resources
  insert_resource(resource: ECSResource<unknown>) {
    this.resources.set(resource.name, resource);

    return this;
  }

  get_resource<T>(resourceName: string): ECSResource<T> | undefined {
    return this.resources.get(resourceName) as ECSResource<T>;
  }
}

/* ****************************************************************************************************************** */
/*                                                 QUERY                                                              */
/* ****************************************************************************************************************** */

class Query {
  readonly world: World;

  private entitiyQueryKeys: Map<String, Set<HashId>> = new Map();

  constructor(world_ref: World) {
    this.world = world_ref;
  }

  // queries
  exact(...components: Array<ComponentCreator<any>>) {
    const results: Map<string, Map<string, Component<any>>> = new Map();

    Array.from(
      this.entitiyQueryKeys.get(this.getKey(components)) || []
    ).forEach((entityId) => {
      const entity = this.world.entity(entityId);
      if (entity) {
        results.set(entityId, entity);
      }
    });

    return results;
  }

  have(...components: Array<ComponentCreator<any>>) {
    const results: Map<string, Map<string, Component<any>>> = new Map();

    const queryKey = this.getKey(components);
    const filtersQueryKey = Array.from(this.entitiyQueryKeys.keys()).filter(
      (k) => k.includes(queryKey)
    );

    filtersQueryKey.forEach((queryKey) => {
      Array.from(this.entitiyQueryKeys.get(queryKey) || []).forEach(
        (entityId) => {
          const entity = this.world.entity(entityId);
          if (entity) {
            results.set(entityId, entity);
          }
        }
      );
    });

    return results;
  }

  // mutations
  addEntity(entityId: HashId, components: Map<string, Component<unknown>>) {
    const queryKey = this.getKey(components);

    const queryRes = this.entitiyQueryKeys.get(queryKey);

    if (!!queryRes) {
      this.entitiyQueryKeys.set(queryKey, queryRes.add(entityId));
    } else {
      this.entitiyQueryKeys.set(queryKey, new Set([entityId]));
    }
  }

  private getKey(
    components: Map<string, Component<unknown>> | Array<ComponentCreator<any>>
  ) {
    if (Array.isArray(components)) {
      const queryKey = components
        .map((c) => c.factoryId)
        .sort()
        .join("||");

      return queryKey;
    } else if (components instanceof Map) {
      const queryKey = Array.from(components.values())
        .map((c) => c.factoryId)
        .sort()
        .join("||");

      return queryKey;
    } else {
      throw new Error("param passes in 'getKey' is neither a Map nor Array");
    }
  }
}

/* ****************************************************************************************************************** */
/*                                                COMMANDS                                                            */
/* ****************************************************************************************************************** */

export class CommandEncoder {
  world: World;

  constructor(world: World) {
    this.world = world;
  }

  /* ******* READ ******* */
  get_resource<T>(resourceName: string): ECSResource<T> | undefined {
    return this.world.get_resource(resourceName);
  }

  query() {
    return this.world.query;
  }

  /* ******* WRITE ******* */
  spawn(...components: Array<Array<Component<unknown>> | Component<unknown>>) {
    this.world.spawn(...components);
  }

  insert_resource(resource: ECSResource<unknown>) {
    this.world.insert_resource(resource);
  }
}

/* ****************************************************************************************************************** */
/*                                            ASSET SERVER                                                            */
/* ****************************************************************************************************************** */

// type Asset = {};

export class AssetServer {
  constructor() {}

  add() {}
}

/* ****************************************************************************************************************** */
/*                                                UTILS                                                               */
/* ****************************************************************************************************************** */

type HashId = string;
function componentUniqueId() {
  return nanoid();
}

// function componentFactoryId() {
//   return nanoid(6);
// }

function entityUniqueId() {
  return nanoid(5);
}

function resourceUniqueId() {
  return nanoid(5);
}

// export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type CompParam<T extends (...args: any) => any> = Parameters<T>[0];
// export type ResourceParam<T extends ECSResource<T>> = Parameters<T>[0];

function defaultValue<T>(a: T, b?: Partial<T>): T {
  if (b === undefined || typeof a !== "object" || typeof b !== "object") {
    return a || (b as T);
  }

  return { ...a, ...b };
}
