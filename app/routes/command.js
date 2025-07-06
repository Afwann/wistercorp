const express = require("express");
const router = express.Router();
const File = require("../models/file");

async function getPath(nodeId) {
  if (!nodeId) return "/";
  let path_arr = [];
  let current = await File.findById(nodeId);
  while (current && current.parentId !== null) {
    path_arr.unshift(current.name);
    current = await File.findById(current.parentId);
  }
  const finalPath = "/" + path_arr.join("/");
  return finalPath.replace("//", "/");
}

function formatLsL(item) {
  const date = new Date(item.createdAt);
  const month = date.toLocaleString("en-US", { month: "short" });
  const day = String(date.getDate()).padStart(2, " ");
  const time = `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
  const size = String(item.size).padStart(6, " ");
  return `${item.permissions} 1 ${item.owner} ${item.group} ${size} ${month} ${day} ${time} ${item.name}`;
}

router.post("/autocomplete", async (req, res) => {
  const { partial, cwdId } = req.body;
  if (!partial) return res.json({ completions: [] });
  const parts = partial.split(" ");
  const token = parts[parts.length - 1];
  if (!token) return res.json({ completions: [] });
  try {
    const regex = new RegExp(`^${token}`, "i");
    const items = await File.find({ parentId: cwdId, name: regex }).select(
      "name type"
    );
    res.json({ completions: items });
  } catch (e) {
    res.json({ completions: [] });
  }
});

router.post("/execute", async (req, res) => {
  const processedCommand =
    req.body.command.trim() === "ll" ? "ls -la" : req.body.command.trim();
  const parts = processedCommand.split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);
  const { cwdId } = req.body;
  try {
    switch (cmd) {
      case "ls":
      case "cat":
      case "cd":
      case "pwd":
        return await handleStandardCommands(cmd, args, cwdId, res);

      case "rm":
        const flags = args.filter((arg) => arg.startsWith("-")).join("");
        const isRecursive = flags.includes("r");
        const isForced = flags.includes("f");
        const target = args.filter((arg) => !arg.startsWith("-"))[0];
        if (isRecursive && isForced && target === "/") {
          return res.json({
            output: `[ ACTION LOGGED ] Initializing system-wide deletion sequence...\n████████████████████████████████████████ 100% Complete.\nSystem integrity compromised.\nError: Core singularity has been breached.\nJust kidding. Did you really think it would be that easy?`,
          });
        } else if (isRecursive && isForced) {
          return res.json({
            output: `[ ACTION LOGGED ] Wow, someone's feeling destructive today!\nInstead of deleting '${
              target || "everything"
            }', I've ordered a virtual pizza.\nIt has zero calories. You're welcome.`,
          });
        } else {
          return res.json({
            output: `[ ACTION LOGGED ] rm: cannot remove '${
              target || ""
            }': Permission denied.`,
          });
        }

      case "sudo":
        return res.json({
          output:
            "[ ACTION LOGGED ] User 'guest' is not in the sudoers file. This incident will be reported.",
        });
      case "ssh":
      case "ftp":
        return res.json({
          output: `[ ACTION LOGGED ] Trying to escape to ${
            args[0] || "another reality"
          }?\nCute. All outbound connections are routed directly to /dev/null.\nEnjoy the void.`,
        });
      case "wget":
      case "curl":
        return res.json({
          output: `[ ACTION LOGGED ] I tried to fetch that for you, but the hamsters that power my internet connection are on their union-mandated lunch break. Please try again later.`,
        });
      case "nmap":
        return res.json({
          output: `[ ACTION LOGGED ] Scanning ${
            args[0] || "localhost"
          }...\nScan report for localhost (127.0.0.1)\nHost is up (0.0001s latency).\nPORT      STATE  SERVICE\n1337/tcp  open   rick-roll\n\nNmap done: 1 IP address (1 host up) scanned. Hint: try to cat this port.`,
        });
      case "whoami":
        return res.json({ output: "guest" });
      case "uname":
        return res.json({
          output:
            "Linux OMNICORP-PFS-01 5.10.0-16-amd64 #1 SMP Debian 5.10.127-1 (2025-07-06) x86_64",
        });
      case "passwd":
        return res.json({
          output: `[ ACTION LOGGED ] Changing password for guest.\nNew password policy: Must be >128 chars, contain three emojis, a character from a dead language, and the soul of a unicorn.\nYour attempt does not meet these criteria.`,
        });

      case "id":
        return res.json({
          output:
            "uid=1001(guest) gid=1001(guest) groups=1001(guest),27(sudo),999(docker)\nWait... why are you in the sudo group? That shouldn't be right. Anomaly detected.",
        });

      case "ps":
        if (args.includes("aux")) {
          return res.json({
            output:
              `USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\n` +
              `root           1  0.0  0.0   1234   567 ?        Ss   00:01   0:01 /sbin/init\n` +
              `root         666  0.1  0.2   5678  1234 ?        S    00:02   0:05 [kthreadd/hamster_wheel]\n` +
              `guest       1337  0.5  0.1   9012  5678 ?        R    00:03   1:30 /usr/bin/sentience_core --mode=aware\n` +
              `root        9001  0.0  0.0   3456   890 ?        S    00:35   0:00 /usr/sbin/sshd -D\n` +
              `guest       9002  0.2  0.3   7890  3456 pts/0    Ss   00:36   0:01 bash\n` +
              `guest       9050  0.0  0.1   2345  1122 pts/0    R+   00:45   0:00 ps aux`,
          });
        }
        return res.json({
          output: `PID   TTY   TIME CMD\n9002 pts/0 00:00:01 bash\n9051 pts/0 00:00:00 ps`,
        });

      case "netstat":
      case "ss":
        if (args.includes("-antp") || args.includes("-tulpn")) {
          return res.json({
            output:
              `Active Internet connections (servers and established)\n` +
              `Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name\n` +
              `tcp        0      0 127.0.0.1:5432          0.0.0.0:* LISTEN      -\n` +
              `tcp        0      0 127.0.0.1:6379          0.0.0.0:* LISTEN      -\n` +
              `tcp        0      0 10.0.0.5:80             NSA_backup_server:443   ESTABLISHED -\n` +
              `tcp        0      0 0.0.0.0:1337            0.0.0.0:* LISTEN      -`,
          });
        }
        return res.json({ output: "COMMAND-LINE-ARGUMENT-REQUIRED" });

      case "history":
        return res.json({
          output:
            `    1  ls -la /etc/\n` +
            `    2  ssh admin@db-prod-01 -p 2222 # use new key\n` +
            `    3  cat /var/log/secure.log | grep "Failed"\n` +
            `    4  sudo rm -rf /var/www/html/test_site/ oops_wrong_dir\n` +
            `    5  history`,
        });

      case "":
        return res.json({ output: "" });
      default:
        return res.json({
          output: `[ ACTION LOGGED ] bash: ${cmd}: command not found`,
        });
    }
  } catch (error) {
    res.status(500).json({ output: `Server Error: ${error.message}` });
  }
});

async function handleStandardCommands(cmd, args, cwdId, res) {
  switch (cmd) {
    case "ls":
      const flagArgs = args.filter((arg) => arg.startsWith("-"));
      const flagChars = flagArgs.map((arg) => arg.substring(1)).join("");
      const validFlags = "al";
      for (const char of flagChars) {
        if (!validFlags.includes(char)) {
          return res.json({
            output: `ls: invalid option -- '${char}'\nTry 'help' for more information.`,
          });
        }
      }
      const isLong = flagChars.includes("l");
      const showHidden = flagChars.includes("a");
      let query = { parentId: cwdId };
      if (!showHidden) {
        query.name = { $not: /^\./ };
      }
      const items = await File.find(query).sort({ name: 1 });
      if (isLong) {
        const output = items.map(formatLsL).join("\n");
        return res.json({ output });
      } else {
        const output = items.map((item) => item.name).join("\t");
        return res.json({ output });
      }
    case "cat":
      if (args[0] === "1337") {
        return res.json({
          output: `Never gonna give you up\nNever gonna let you down\nNever gonna run around and desert you...`,
        });
      }
      if (!args[0]) return res.json({ output: "cat: missing operand" });
      const file = await File.findOne({
        name: args[0],
        parentId: cwdId,
        type: "file",
      });
      if (!file) {
        const dir = await File.findOne({
          name: args[0],
          parentId: cwdId,
          type: "directory",
        });
        return res.json({
          output: dir
            ? `cat: ${args[0]}: Is a directory`
            : `cat: ${args[0]}: No such file or directory`,
        });
      }
      return res.json({ output: file.content });
    case "cd":
      if (args.length === 0 || args[0] === "~") {
        const home = await File.findOne({ name: "home", type: "directory" });
        const guest = await File.findOne({ name: "guest", parentId: home._id });
        const newPath = await getPath(guest._id);
        return res.json({ newCwdId: guest._id, path: newPath });
      }
      const targetPath = args[0];
      if (targetPath === "..") {
        const currentDir = await File.findById(cwdId);
        const newCwdId =
          currentDir && currentDir.parentId ? currentDir.parentId : cwdId;
        const newPath = await getPath(newCwdId);
        return res.json({ newCwdId, path: newPath });
      }
      if (targetPath === "/") {
        const root = await File.findOne({ parentId: null });
        return res.json({ newCwdId: root._id, path: "/" });
      }
      const targetDir = await File.findOne({
        name: targetPath,
        parentId: cwdId,
        type: "directory",
      });
      if (!targetDir) {
        return res.json({
          output: `cd: ${targetPath}: No such directory or it is a file`,
        });
      }
      const newPath = await getPath(targetDir._id);
      return res.json({ newCwdId: targetDir._id, path: newPath });
    case "pwd":
      const absolutePath = await getPath(cwdId);
      return res.json({ output: absolutePath });
  }
}

module.exports = router;
