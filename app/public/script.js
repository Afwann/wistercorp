document.addEventListener("DOMContentLoaded", async () => {
  const terminal = document.getElementById("terminal");
  const outputDiv = document.getElementById("output");
  const input = document.getElementById("input");
  const promptSpan = document.getElementById("prompt");
  const API_URL = "/api";

  const modalOverlay = document.getElementById("modal-overlay");
  const modalContent = document.getElementById("modal-content");
  const modalClose = document.getElementById("modal-close");
  const modalDownloadBtn = document.getElementById("modal-download-btn");

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
    }
  }

  function closeModal() {
    modalOverlay.classList.remove("active");
    modalContent.innerHTML = "";
  }
  modalClose.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", (e) => {
    if (e.target.id === "modal-overlay") {
      closeModal();
    }
  });

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
    if (e.key === "Escape") {
      closeModal();
    }
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
          const helpText = `

A weary note from your friendly neighborhood SysAdmin...

Look, WISTERCORP Legal makes me show you the big scary warning when you log in.
Here's the real deal. You have access to a few basic commands to look around.

  ls [-al]    - See what's here.
  ll          - See what's here, but fancier.
  cd [dir]    - Go somewhere else.
  cat [file]  - Read something. Probably boring.
  pwd         - In case you get lost.
  open [file] - If you're lucky, it might just work on a PDF.
  clear       - Tidy up the place.
  help        - You're reading it.

Shell Pro-Tips:
  - The [Tab] key is your best friend. Use it. It saves me from having
    to decipher your typos.
  - [cd] is smarter than it looks. It handles absolute paths (/home/guest),
    multi-level jumps (../../..), and typing [cd] alone teleports you home.

--- Undocumented Features (Don't tell Legal I showed you this) ---
Here are a few extra commands I probably shouldn't be telling you about.
But let's be honest, you were going to try them anyway, weren't you?

  uname       - See what fancy Linux box you're about to fail at hacking.
  id          - Check your 'privileges'. They might surprise you.
  ps aux      - See what ghosts are running in the machine.
  whoami      - For when you have an existential crisis.
  netstat     - See all the interesting places this server isn't talking to.

Everything you do is logged. Yes, even that. My server is already full of
'rm -rf /' attempts from last week. Try to be original, at least.

If you manage to break something, the system will file a ticket automatically.
My response time is somewhere between 'next Tuesday' and 'the heat death of
the universe'. Good luck.

P.S. There are even more commands that aren't on *either* of these lists. Happy hunting.

`;
          printOutput(helpText);
        } else {
          const result = await executeCommand(command);

          // --- BLOK LOGIKA 'open_modal' YANG DIPERBAIKI TOTAL ---
          if (result.action === "open_modal") {
            // Cek apakah file adalah PDF
            if (/\.pdf$/i.test(result.url)) {
              // --- PERUBAHAN UTAMA: Menggunakan <embed> bukan <iframe> ---
              modalContent.innerHTML = `<embed src="${result.url}" type="application/pdf" width="100%" height="100%" />`;
            } else {
              // Jika bukan PDF, tampilkan pesan error di dalam modal
              modalContent.innerHTML = `<p style="color:white; padding: 2em; text-align: center;">Preview for this file type is not available.<br><br>Please use the download button.</p>`;
            }

            modalDownloadBtn.href = result.url;
            modalDownloadBtn.download = result.filename;
            modalOverlay.classList.add("active");
            printOutput(result.message);
          } else if (result.output || result.output === "") {
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
      if (historyIndex >= 0) {
        historyIndex--;
        input.value = historyIndex === -1 ? "" : commandHistory[historyIndex];
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
