import {packageName} from "./global.constants";

const fs = require('fs');
const path = require('path');

export class Utils {
  /**
   * @function
   * @description
   * Loads JSON file from path
   * @param filePath {string} path to JSON file
   * @return {any} the JSON file parsed as a Javascript object
   **/
  public static loadJSONFile(filePath: string): any {
    try {
      return JSON.parse(fs.readFileSync(path.join(filePath)));
    } catch(e) {
      throw packageName + ': Cannot load file at path ' + filePath;
    }
  }
}
