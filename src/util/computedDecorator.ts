import { PropertyValueMap } from 'lit';

interface ComputedProperty {
  observedProperties: string[];
  computedDependencies: string[];
  originalGetter: () => any;
}

type ComputedPropertyMap = Map<string | symbol, ComputedProperty>;

function wrapWillUpdate(target: any) {
  const targetHasWillUpdate = Object.prototype.hasOwnProperty.call(
    target,
    'willUpdate'
  );

  const originalWillUpdate = targetHasWillUpdate
    ? target.willUpdate
    : undefined;

  Object.defineProperty(target, 'willUpdate', {
    value: function willUpdate(
      _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
    ) {
      if (originalWillUpdate) {
        originalWillUpdate.call(this, _changedProperties);
      } else {
        const dynSuper = Object.getPrototypeOf(this.constructor.prototype);
        dynSuper.willUpdate.call(this, _changedProperties);
      }

      const computedProperties =
        target.__computedProperties as ComputedPropertyMap;

      for (const [key, property] of computedProperties) {
        if (property.observedProperties.some(p => _changedProperties.has(p))) {
          Object.defineProperty(this, key, {
            value: property.originalGetter.bind(this)(),
            configurable: true,
          });
        }
      }
    },
  });
}

function resolveTransientDependencies(
  computedProperties: ComputedPropertyMap
): ComputedPropertyMap {
  return new Map(
    [...computedProperties.entries()].map(([key, property]) => {
      const propertyWithTransient = {
        ...property,
      };

      for (const p of property.observedProperties) {
        if (computedProperties.has(p)) {
          const mergedProperties = new Set([
            ...property.observedProperties,
            ...computedProperties.get(p)!.observedProperties,
          ]);
          mergedProperties.delete(p);

          propertyWithTransient.observedProperties = [...mergedProperties];
          propertyWithTransient.computedDependencies.push(p);
        }
      }

      return [key, propertyWithTransient];
    })
  );
}

function sortByComputedDependencies(
  computedProperties: ComputedPropertyMap
): ComputedPropertyMap {
  return new Map(
    [...computedProperties.entries()].sort((a, b) => {
      const [aKey, aProp] = a;
      const [bKey, bProp] = b;
      const aDeps = aProp.computedDependencies;
      const bDeps = bProp.computedDependencies;

      if (aDeps.length === 0) {
        return -1;
      }

      if (bDeps.length === 0) {
        return 1;
      }

      if (aDeps.includes(String(bKey)) && bDeps.includes(String(aKey))) {
        throw new Error(
          `Cannot have circular dependencies between computed properties: ${String(
            aKey
          )} and ${String(bKey)}`
        );
      }

      if (aDeps.includes(String(bKey))) {
        return 1;
      }

      if (bDeps.includes(String(aKey))) {
        return -1;
      }

      return 0;
    })
  );
}

export function computed(...observedProperties: string[]): MethodDecorator {
  return (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) => {
    if (descriptor.get === undefined) {
      throw new Error(
        '@computed decorator can only be used on getter functions'
      );
    }

    const originalGetter = descriptor.get;

    const computedProperty: ComputedProperty = {
      observedProperties,
      computedDependencies: [],
      originalGetter,
    };

    if (!('__computedProperties' in target)) {
      const ComputedPropertyMap: ComputedPropertyMap = new Map([
        [propertyKey, computedProperty],
      ]);

      Object.defineProperty(target, '__computedProperties', {
        value: ComputedPropertyMap,
        writable: true,
      });

      wrapWillUpdate(target);
    } else {
      let computedProperties: ComputedPropertyMap = target.__computedProperties;
      computedProperties.set(propertyKey, computedProperty);
      computedProperties = resolveTransientDependencies(computedProperties);
      computedProperties = sortByComputedDependencies(computedProperties);

      // eslint-disable-next-line no-param-reassign
      target.__computedProperties = computedProperties;

      // TODO: check if all dependencies are computed properties or reactive properties
    }
  };
}
