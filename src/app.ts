import {sayHi} from "./tools.js";
import {EventEmitter} from "node:events";
import {createServer, IncomingMessage} from "node:http";
import {addUser, getAllUsers, getUser, removeUser, updateUser, User} from "./model/users.ts";

const myName = "Sara";
sayHi(myName);

const myEmitter = new EventEmitter();

//==========Sintax===========
// myEmitter.on('eventName', (value1, value2...) => {
//     console.log("myEvent");
// })
// myEmitter.emit('eventName', [value1, value2...]);

// myEmitter.on('less_than_0.5', (value) => console.log(`${value} < 0,5`))
// myEmitter.on('greater_than_0.5', (value) => console.log(`${value} > 0,5`))
// myEmitter.on('equal_0.5', (value) => console.log(`${value} = 0,5`))
//
//
// for (let i = 0; i < 10; i++) {
//     let rand = Math.random();
//     if (rand === 0.5) myEmitter.emit('equal_0.5', rand);
//     else if (rand < 0.5) myEmitter.emit('less_than_0.5', rand);
//     else myEmitter.emit('greater_than_0.5', rand);
// }

const myServer =
    createServer(async (req, res) => {
        const {url, method} = req;

        function parseBody(req: InstanceType<typeof IncomingMessage>) {
            return new Promise((resolve, reject) => {
                let body = "";
                req.on('data', (chunk) => {
                    body += chunk.toString();
                })
                req.on('end', () => {
                    try {
                        resolve(JSON.parse(body));
                    } catch (e) {
                        reject(new Error('Invalid JSON'));
                    }
                })
            })
        }

        function extractIdFromUrl(url: string): number | null {
            const match = url.match(/\/api\/users\/(\d+)/);
            return match ? parseInt(match[1]) : null;
        }

        const userId = extractIdFromUrl(url!);

        const baseUrl = userId !== null ? "/api/users/:id" : url;

        switch (`${baseUrl}${method}`) {
            case "/api/users" + "POST": {
                const body = await parseBody(req);
                if (body) {
                    addUser(body as User)
                    res.writeHead(201, {"Content-Type": "text/plain"});
                    res.end("User was added")
                } else {
                    res.writeHead(409, {"Content-Type": "text/plain"});
                    res.end("User already exists")
                }
                break;
            }
            case "/api/users" + "GET" : {
                res.writeHead(200, {"Content-Type": "application/json"});
                res.end(JSON.stringify(getAllUsers()))
                break;
            }
            case "/api/users/:id" + "PUT" : {
                try {
                    const body = await parseBody(req) as User;
                    if (!body.id || !body.userName) {
                        res.writeHead(400, { "Content-Type": "text/plain" });
                        res.end("Invalid user data");
                        return;
                    }
                    if (updateUser(body)) {
                        res.writeHead(200, { "Content-Type": "text/plain" });
                        res.end("User updated successfully");
                    } else {
                        res.writeHead(404, { "Content-Type": "text/plain" });
                        res.end("User not found");
                    }
                } catch (error) {
                    res.writeHead(400, { "Content-Type": "text/plain" });
                    res.end("Invalid JSON");
                }
                break;
            }
            case "/api/users/:id" + "GET": {
                const user = getUser(userId);
                if (user) {
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify(user));
                } else {
                    res.writeHead(404, { "Content-Type": "text/plain" });
                    res.end("User not found");
                }
                break;
            }
            case "/api/users/:id" + "DELETE": {
                const removedUser = removeUser(userId);
                if (removedUser) {
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({
                        message: "User deleted successfully",
                        deletedUser: removedUser
                    }));
                } else {
                    res.writeHead(404, { "Content-Type": "text/plain" });
                    res.end("User not found");
                }
                break;
            }
            default:
                res.writeHead(404, {"Content-Type": "text/plain"});
                res.end("Not found")
                break;
        }
    })

myServer.listen(3005, () => console.log(`Server runs at http://localhost:3005`));
