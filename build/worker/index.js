import { projects } from "../config/project-names.mjs";
  
  export default {
    async fetch(request, env) {
      const url = new URL(request.url);
  
      for (const project of projects) {

        if (project.path === "/") {
          continue;
        }

        if (
          url.pathname === project.path ||
          url.pathname.startsWith(project.path + "/")
        ) {
          url.pathname = project.path + "/index.html";
  
          return env.ASSETS.fetch(
            new Request(url, request)
          );
        }
      }
  
      console.log("Worker is running");
      
      url.pathname = "/index.html";

      return env.ASSETS.fetch(
        new Request(url, request)
      );
    },
  };