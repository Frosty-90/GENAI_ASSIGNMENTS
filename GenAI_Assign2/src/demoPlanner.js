function extractReferenceSite(input) {
  const urlMatch = input.match(/https?:\/\/[^\s)]+/i);
  if (urlMatch) {
    try {
      const url = new URL(urlMatch[0]);
      return url.hostname.replace(/^www\./, "");
    } catch {
      return "";
    }
  }

  if (input.toLowerCase().includes("scaler")) {
    return "scaler.com";
  }

  if (input.toLowerCase().includes("amazon")) {
    return "amazon.com";
  }

  return "";
}

function extractFolderPath(input) {
  const quoted = input.match(/(?:folder|directory)\s+(?:named\s+)?["']([^"']+)["']/i);
  if (quoted) {
    return quoted[1];
  }

  const plain = input.match(/(?:folder|directory)\s+(?:named\s+)?([a-zA-Z0-9-_./]+)/i);
  if (plain) {
    return plain[1];
  }

  const referenceSite = extractReferenceSite(input);
  if (referenceSite) {
    return `output/${referenceSite.replace(/\./g, "-")}-clone`;
  }

  if (input.toLowerCase().includes("scaler")) {
    return "output/scaler-clone";
  }

  return "output/generated-site";
}

function detectBrandName(input) {
  if (input.toLowerCase().includes("scaler")) {
    return "Scaler Academy";
  }

  if (input.toLowerCase().includes("amazon")) {
    return "Amazon";
  }

  const referenceSite = extractReferenceSite(input);
  if (referenceSite) {
    return referenceSite
      .replace(/\.[a-z]+$/i, "")
      .split(/[-.]/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  const match = input.match(/for\s+([a-zA-Z0-9 &-]{3,40})/i);
  return match?.[1]?.trim() || "Generated Brand";
}

function isWebsiteTask(input) {
  const text = input.toLowerCase();
  return ["website", "webpage", "landing page", "html", "clone"].some((term) => text.includes(term));
}

export function createOfflinePlan(userInput) {
  if (!isWebsiteTask(userInput)) {
    return [
      {
        step: "START",
        content: "The request does not match the supported offline demo capabilities.",
        tool_name: "",
        tool_args: {},
      },
      {
        step: "OUTPUT",
        content:
          "Offline mode currently demonstrates website-generation tasks. Add a GEMINI_API_KEY for broader live conversations, or ask me to create a website or clone-style landing page.",
        tool_name: "",
        tool_args: {},
      },
    ];
  }

  const folderPath = extractFolderPath(userInput);
  const brandName = detectBrandName(userInput);
  const referenceSite = extractReferenceSite(userInput);

  return [
    {
      step: "START",
      content:
        "The user wants a browser-ready website project created through the CLI agent rather than a one-shot answer.",
      tool_name: "",
      tool_args: {},
    },
    {
      step: "THINK",
      content:
        "I should create a dedicated project folder first so the generated files are grouped cleanly.",
      tool_name: "",
      tool_args: {},
    },
    {
      step: "TOOL",
      content: "",
      tool_name: "create_folder",
      tool_args: {
        folderPath,
      },
    },
    {
      step: "THINK",
      content:
        "Now I can generate a minimal HTML, CSS, and JavaScript website in that folder using the website builder capability.",
      tool_name: "",
      tool_args: {},
    },
    {
      step: "TOOL",
      content: "",
      tool_name: "create_website_project",
      tool_args: {
        folderPath,
        brandName,
        inspirationSite: referenceSite || (userInput.toLowerCase().includes("scaler") ? "scaler.com" : ""),
        brief: userInput,
        requiredSections: ["Header", "Hero Section", "Footer"],
      },
    },
    {
      step: "THINK",
      content:
        "I should verify the folder contents before reporting completion.",
      tool_name: "",
      tool_args: {},
    },
    {
      step: "TOOL",
      content: "",
      tool_name: "list_files",
      tool_args: {
        targetPath: folderPath,
      },
    },
    {
      step: "OUTPUT",
      content: `The website project is ready in ${folderPath}. Open ${folderPath}/index.html in a browser to review it.`,
      tool_name: "",
      tool_args: {},
    },
  ];
}
