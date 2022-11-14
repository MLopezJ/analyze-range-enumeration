import { writeFile } from "fs/promises";
import { groupByObject } from "../src/groupByObject";

const listOfObjectsFile = process.argv[process.argv.length - 2];
const outFile = process.argv[process.argv.length - 1];
const objects = await import(listOfObjectsFile);
const value = groupByObject(objects.list);

await writeFile(
  outFile,
  `const list = [ ${value.map((element: { objectId: string; items: any[] }) => {
    return `{
    objectId: "${element.objectId}",
    items: [${element.items.map(
      (item: { itemId: string; rangeEnumeration: string; unit: string }) => {
        return `{
            itemId: "${item.itemId}",
            rangeEnumeration: "${item.rangeEnumeration}",
            unit: "${item.unit}"
        }`;
      }
    )}]
}`;
  })}]`
);
