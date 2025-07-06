document.addEventListener("DOMContentLoaded", async () => {
  const terminal = document.getElementById("terminal");
  const outputDiv = document.getElementById("output");
  const input = document.getElementById("input");
  const promptSpan = document.getElementById("prompt");
  const API_URL = "/api";

  let cwdId = null;
  let commandHistory = [];
  let historyIndex = -1;

  async function executeCommand(command) {
    try {
      const res = await fetch(`${API_URL}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command, cwdId }),
      });
      return await res.json();
    } catch (error) {
      return { output: "Error: Could not connect to the server." };
    }
  }

  function printOutput(text) {
    if (text || text === "") {
      const pre = document.createElement("pre");
      pre.style.margin = "0";
      pre.style.fontFamily = "inherit";
      pre.textContent = text;
      outputDiv.appendChild(pre);
    }
  }

  function printCommand(command) {
    const line = document.createElement("div");
    const promptClone = document.createElement("span");
    promptClone.className = "prompt-clone";
    promptClone.textContent = promptSpan.textContent;
    line.appendChild(promptClone);

    const commandText = document.createElement("span");
    commandText.textContent = ` ${command}`;
    line.appendChild(commandText);

    outputDiv.appendChild(line);
  }

  function updatePrompt(path) {
    const homePath = "/home/guest";
    let displayPath;
    if (path === homePath || (path && path.startsWith(homePath + "/"))) {
      displayPath = "~" + path.substring(homePath.length);
    } else {
      displayPath = path;
    }
    promptSpan.textContent = `guest@WISTERCORP-PFS-01:${displayPath}$`;
  }

  async function initialize() {
    try {
      const response = await executeCommand("cd ~");
      if (response.newCwdId) {
        cwdId = response.newCwdId;
        updatePrompt(response.path);
        const motd = await executeCommand("cat .motd");
        if (motd && motd.output) {
          printOutput(motd.output);
        }
      }
    } catch (error) {
      printOutput("Error initializing terminal. Could not connect to backend.");
      console.error(error);
    }
  }

  async function handleAutocomplete() {
    const partialCommand = input.value;
    const res = await fetch(`${API_URL}/autocomplete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partial: partialCommand, cwdId }),
    });
    const { completions } = await res.json();
    if (completions.length === 1) {
      const item = completions[0];
      const parts = partialCommand.split(" ");
      parts[parts.length - 1] = item.name;
      input.value = parts.join(" ") + (item.type === "directory" ? "/" : " ");
    } else if (completions.length > 1) {
      printCommand(partialCommand);
      printOutput(completions.map((c) => c.name).join("\t"));
    }
  }

  input.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
      const command = input.value.trim();
      printCommand(command);

      if (command) {
        if (commandHistory[0] !== command) {
          commandHistory.unshift(command);
          if (commandHistory.length > 50) commandHistory.pop();
        }
        historyIndex = -1;

        if (command === "clear") {
          outputDiv.innerHTML = "";
        } else if (command === "help") {
          const helpText = `WISTERCORP Proprietary Shell (WPS), version 1.3.3.7
These shell commands are defined internally for guest users.

Standard Commands:
ls [-al]        List directory contents
ll              Alias for 'ls -la'
cat [file]      Display file content
cd [dir]        Change directory
pwd             Print name of current working directory
clear           Clear the terminal screen
history         Display command history
help            Display this help message

Note: This is a list of officially supported commands. Use of any other
commands, especially those related to system modification, network
reconnaissance, or privilege escalation, is a violation of WISTERCORP
Acceptable Use Policy A-113 and will be logged for review.`;
          printOutput(helpText);
        } else {
          const result = await executeCommand(command);
          if (result.output || result.output === "") {
            printOutput(result.output);
          }
          if (result.newCwdId) {
            cwdId = result.newCwdId;
            updatePrompt(result.path);
          }
        }
      }

      input.value = "";
      terminal.scrollTop = terminal.scrollHeight;
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        input.value = commandHistory[historyIndex];
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        historyIndex--;
        input.value = commandHistory[historyIndex];
      } else {
        historyIndex = -1;
        input.value = "";
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      await handleAutocomplete();
    }
  });

  terminal.addEventListener("click", () => {
    input.focus();
  });

  initialize();
});
