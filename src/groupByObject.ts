/**
 * Having received a list of items, group the values with the same object id
 * @param list 
 * @returns 
 */
export const groupByObject = (list: any[]) =>
  list.reduce((accumulator, current) => {
    if (accumulator.length === 0)
      return [
        {
          objectId: current.objectId,
          items: [
            {
              itemId: current.itemId,
              rangeEnumeration: current.rangeEnumeration,
              unit: current.unit,
            },
          ],
        },
      ];

    const lastElement = accumulator[accumulator.length - 1];

    if (lastElement.objectId === current.objectId) {
      const object = accumulator.pop();

      const item = {
        itemId: current.itemId,
        rangeEnumeration: current.rangeEnumeration,
        unit: current.unit,
      };

      object.items.push(item);

      accumulator.push(object)

      return accumulator;
    }

    accumulator.push({
      objectId: current.objectId,
      items: [
        {
          itemId: current.itemId,
          rangeEnumeration: current.rangeEnumeration,
          unit: current.unit,
        },
      ],
    });

    return accumulator;
  }, []);

// TODO: add tests 