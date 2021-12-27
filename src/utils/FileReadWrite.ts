import { writeFile, readFile } from "fs/promises";
import { writeFileSync, readFileSync } from "fs";

class FileReadWrite {
  static async writeToFile(data: string, filePath: string, flag: string): Promise<void> {
    try {
      await writeFile(filePath, data, { flag });
    } catch (error) {
      console.error(error);
    }
  }

  static writeToFileSync(data: string, filePath: string, flag: string): void {
    try {
      writeFileSync(filePath, data, { flag });
    } catch (error) {
      console.error(error);
    }
  }

  static async readFromFile(filePath: string, flag: string): Promise<string | void> {
    try {
      const content: string = await readFile(filePath, { flag, encoding: "utf8" });
      return content;
    } catch (error) {
      console.error(error);
    }
  }

  static readFromFileSync(filePath: string, flag: string): string | void {
    try {
      const content: string = readFileSync(filePath, { flag, encoding: "utf8" });
      return content;
    } catch (error) {
      console.error(error);
    }
  }
}

export default FileReadWrite;
