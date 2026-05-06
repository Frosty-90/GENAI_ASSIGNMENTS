import fs from "node:fs";
import path from "node:path";
import { createWebsiteProjectFiles } from "./siteBuilder.js";

function resolveInsideWorkspace(targetPath = ".") {
  const workspaceRoot = process.cwd();
  const resolved = path.resolve(workspaceRoot, targetPath);

  if (!resolved.startsWith(workspaceRoot)) {
    throw new Error("Refusing to access files outside the current workspace.");
  }

  return resolved;
}

function summariseDirectoryEntries(entries) {
  if (!entries.length) {
    return "Directory is empty.";
  }

  return entries
    .map((entry) => `${entry.isDirectory() ? "[DIR]" : "[FILE]"} ${entry.name}`)
    .join("\n");
}

export const toolDefinitions = [
  {
    name: "create_folder",
    description: "Create a folder inside the current workspace.",
    input: {
      folderPath: "Relative folder path to create.",
    },
  },
  {
    name: "write_file",
    description: "Write a text file inside the current workspace.",
    input: {
      filePath: "Relative file path to write.",
      content: "Full text content to write into the file.",
    },
  },
  {
    name: "read_file",
    description: "Read a text file inside the current workspace.",
    input: {
      filePath: "Relative file path to read.",
    },
  },
  {
    name: "list_files",
    description: "List files and folders at a workspace path.",
    input: {
      targetPath: "Relative path to inspect. Use . for the workspace root.",
    },
  },
  {
    name: "create_website_project",
    description:
      "Generate a minimal browser-ready HTML/CSS/JS website project in the target folder from a natural-language brief and reference-site context.",
    input: {
      folderPath: "Relative output folder path.",
      brandName: "Brand or site name for the generated project.",
      inspirationSite: "Optional reference site name or domain such as scaler.com.",
      brief: "Natural-language description of the requested site.",
      requiredSections: "Optional list of sections that must appear in the generated page.",
    },
  },
];

export const toolMap = {
  create_folder: ({ folderPath }) => {
    const resolved = resolveInsideWorkspace(folderPath);
    fs.mkdirSync(resolved, { recursive: true });
    return `Created folder at ${path.relative(process.cwd(), resolved)}`;
  },
  write_file: ({ filePath, content }) => {
    const resolved = resolveInsideWorkspace(filePath);
    fs.mkdirSync(path.dirname(resolved), { recursive: true });
    fs.writeFileSync(resolved, content, "utf8");
    return `Wrote file ${path.relative(process.cwd(), resolved)}`;
  },
  read_file: ({ filePath }) => {
    const resolved = resolveInsideWorkspace(filePath);
    const content = fs.readFileSync(resolved, "utf8");
    return `Contents of ${path.relative(process.cwd(), resolved)}:\n${content}`;
  },
  list_files: ({ targetPath = "." }) => {
    const resolved = resolveInsideWorkspace(targetPath);
    const entries = fs.readdirSync(resolved, { withFileTypes: true });
    return `Listing for ${path.relative(process.cwd(), resolved) || "."}:\n${summariseDirectoryEntries(entries)}`;
  },
  create_website_project: ({
    folderPath = "output/generated-site",
    brandName = "Generated Brand",
    inspirationSite = "",
    brief = "",
    requiredSections = [],
  }) => {
    const resolved = resolveInsideWorkspace(folderPath);
    fs.mkdirSync(resolved, { recursive: true });

    const files = createWebsiteProjectFiles({
      folderPath,
      brandName,
      inspirationSite,
      brief,
      requiredSections,
    });

    Object.entries(files).forEach(([name, content]) => {
      fs.writeFileSync(path.join(resolved, name), content, "utf8");
    });

    return `Generated website project in ${path.relative(process.cwd(), resolved)} with files: ${Object.keys(files).join(", ")}`;
  },
};
