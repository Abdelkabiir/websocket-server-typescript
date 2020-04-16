import { APP_PORT } from "./utils/constants";
import * as http from "http";

var httpServer = http.createServer(() => {});
httpServer.listen(APP_PORT, () => {
  console.log(new Date() + " App is running on port " + APP_PORT);
});