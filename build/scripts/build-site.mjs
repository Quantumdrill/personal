import { execSync } from "node:child_process";
import { cpSync, mkdirSync, rmSync } from "node:fs";
import { projects } from "../config/project-names.mjs";

rmSync("./site-dist", {
  recursive: true,
  force: true,
});

mkdirSync("./site-dist", {
  recursive: true,
});

for (const project of projects) {
  const projectPath = `./projects/${project.folder}`;

  execSync(`npm run build --prefix "${projectPath}"`, {
    stdio: "inherit",
  });

  const source = `${projectPath}/dist`;
  const destination =
    project.path === "/"
      ? "./site-dist"
      : `./site-dist/${project.path}`;

  cpSync(source, destination, {
    recursive: true,
  });
}