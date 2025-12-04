import "dotenv/config";
import createServer from './app';
import { prisma } from "./lib/prisma";


createServer().then((url) => {
    console.log(`🚀  Server ready at: ${url}`);
}).catch((error) => {
    console.error('Error starting server:', error);
});