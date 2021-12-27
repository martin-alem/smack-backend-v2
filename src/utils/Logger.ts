import FileReadWrite from "./FileReadWrite.js";
import { getFormattedDate } from "./util.js";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = path.join(__dirname, "../log");

class Logger {
  /**
   * Logs error
   * @param type Type of error to be logged
   * @param error The error to be logged
   * @param file The file the error occurred in.
   */
  static log(type: string, error: Error, file: string) {
    if (process.env.MODE === "development") {
      console.log(`${type.toUpperCase()}: ${error} - ${file} - ${new Date()}`);
    } else if (process.env.MODE === "production") {
      const data: string = `${type}: ${error.message} - ${new Date()} - ${file}\n`;
      const filePath: string = path.join(BASE, `${getFormattedDate()}.log`);
      FileReadWrite.writeToFile(data, filePath, "a+");
    }
  }
}

export default Logger;
