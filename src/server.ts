import { createApp } from "./app";

createApp()
	.then((url) => {
		console.log(`🚀  Server ready at: ${url}`);
	})
	.catch((error) => {
		console.error("Error starting server:", error);
	});
