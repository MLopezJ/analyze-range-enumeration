//About: get how many of the objects are multiple instance and how many are single instance

// TODO: move to src

import path from "path";
import fs from "fs";
import { readFile, writeFile } from "fs/promises";

const EXTENSION = ".json";
const dirpath = path.join("./lwm2m-registry-json");

const m2mFriendly: {
  objectId: string;
  itemId: string;
  rangeEnumeration: string;
  unit: string;
}[] = [];

const notM2mFriendly: {
  objectId: string;
  itemId: string;
  rangeEnumeration: string;
  unit: string;
}[] = [];

const rangeEnumerationNotDefined: {
  objectId: string;
  itemId: string;
  rangeEnumeration: null | string;
  unit: string;
}[] = [];

/**
 * Return true if format is invalid, false if it is valid.
 *
 * allowed formats:
 * 1- NUMBER..NUMBER
 * 2- NUMBER, NUMBER, NUMBER
 * @param item
 * @returns
 */
const isInvalidFormat = (item: any) =>
  item
    .split(/[..]|,/g)
    .some((element: any) => element.length > 0 && isNaN(+element));

/**
 *
 * remove special characters related to white space: \n \r \t
 *
 * @param value
 * @returns string
 */
const replaceWhiteSpace = (value: string): string =>
  value.replaceAll(/\n/g, " ").replaceAll(/\r/g, " ").replaceAll(/\t/g, " ");

/**
 * Those files are not processed because they dont contain the range enumeration property
 */
const excludedFiles = ["Common", "DDF", "LWM2M_senml_units"]; //  "LWM2M-v1_1", "LWM2M"

/**
 *
 * Read file
 * @param element
 */
const readJson = async (element: any) => {
  const fileName = element.split(".")[0];

  if (!excludedFiles.includes(fileName)) {
    console.log(`-- processing element ${fileName} --`);
    const jsonPath = `./lwm2m-registry-json/${fileName}.json`;
    const json = JSON.parse(await readFile(jsonPath, "utf-8"));

    const objectId = json.LWM2M.Object[0].ObjectID[0];
    // TODO: create method
    json.LWM2M.Object[0].Resources[0].Item.map(
      (element: {
        ATTR: { ID: string };
        RangeEnumeration: string[];
        Units: string[];
      }) => {
        const itemId = element.ATTR.ID;
        let rangeEnumeration = element.RangeEnumeration[0];
        let unit = element.Units[0];

        rangeEnumeration = replaceWhiteSpace(rangeEnumeration);
        unit = replaceWhiteSpace(unit);

        const object = { objectId, itemId, rangeEnumeration, unit };

        // empty case
        if (
          rangeEnumeration.length === 0 ||
          rangeEnumeration.trim().length === 0
        ) {
          rangeEnumerationNotDefined.push(object);
          return;
        }

        if (isInvalidFormat(rangeEnumeration)) notM2mFriendly.push(object);
        else m2mFriendly.push(object);

        console.log(object);
      }
    );
  }
};

/*
 */
fs.readdir(dirpath, async (err, files) => {
  for (const file of files) {
    if (path.extname(file) === EXTENSION) {
      await readJson(file);
    }
  }

  await writeFile(
    "./values/items/rangeEnumerationNotDefined.ts",
    `export const list = [${rangeEnumerationNotDefined.map(
      (element) => {
        return `{ objectId: "${element.objectId}", itemId: "${
          element.itemId
        }", rangeEnumeration: "${element.rangeEnumeration}", unit:  ${
          element.unit !== null ? `"${element.unit}"` : null
        } }`;
      }
    )}]`
  );

  await writeFile(
    "./values/items/m2mFriendly.ts",
    `export const list = [${m2mFriendly.map((element) => {
      return `{ objectId: "${element.objectId}", itemId: "${
        element.itemId
      }", rangeEnumeration: "${element.rangeEnumeration}", unit:  ${
        element.unit !== null ? `"${element.unit}"` : null
      } }`;
    })}]`
  );

  await writeFile(
    "./values/items/notM2mFriendly.ts",
    `export const list = [${notM2mFriendly.map((element) => {
      return `{ objectId: "${element.objectId}", itemId: "${
        element.itemId
      }", rangeEnumeration: "${element.rangeEnumeration}", unit:  ${
        element.unit !== null ? `"${element.unit}"` : null
      } }`;
    })}]`
  );
});
