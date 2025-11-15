import createServer from './app';


createServer().then((url) => {
    console.log(`🚀  Server ready at: ${url}`);
}).catch((error) => {
    console.error('Error starting server:', error);
});