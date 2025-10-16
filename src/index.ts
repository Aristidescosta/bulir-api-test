import { server } from "./server/Server";

server.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});