class Errorhandler extends Error {
  public statusCode: number;
  public message: string;
  public code: string;
  constructor(message: string, statusCode: number, code: string) {
    super();
    this.statusCode = statusCode;
    this.message = message;
    this.code = code;
    return this;
  }
}
export default Errorhandler;
