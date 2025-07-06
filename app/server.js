const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const File = require("./models/file");
const commandRoutes = require("./routes/command");

const app = express();
const PORT = 3000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://mongo:27017/terminaldb";

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.set("trust proxy", true);

// Koneksi ke MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Successfully connected to MongoDB.");
    seedDatabase();
  })
  .catch((err) => console.error("Connection error", err));

// Routes
app.use("/api", commandRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

async function seedDatabase() {
  try {
    const count = await File.countDocuments();
    if (count > 0) {
      console.log("Honeypot filesystem already exists. Skipping seed.");
      return;
    }

    console.log("Seeding FINAL HONEPOT filesystem...");

    const randSize = () => Math.floor(Math.random() * 2048) + 100;

    const root = await File.create({
      name: "/",
      type: "directory",
      parentId: null,
      permissions: "drwxr-xr-x",
      size: 4096,
    });
    const home = await File.create({
      name: "home",
      type: "directory",
      parentId: root._id,
      permissions: "drwxr-xr-x",
      size: 4096,
    });
    const guest = await File.create({
      name: "guest",
      type: "directory",
      parentId: home._id,
      permissions: "drwxr-xr-x",
      size: 4096,
    });
    const etc = await File.create({
      name: "etc",
      type: "directory",
      parentId: root._id,
      permissions: "drwxr-xr-x",
      size: 4096,
    });
    const varDir = await File.create({
      name: "var",
      type: "directory",
      parentId: root._id,
      permissions: "drwxr-xr-x",
      size: 4096,
    });
    const logDir = await File.create({
      name: "log",
      type: "directory",
      parentId: varDir._id,
      permissions: "drwxr-xr-x",
      size: 4096,
    });
    const bin = await File.create({
      name: "bin",
      type: "directory",
      parentId: root._id,
      permissions: "drwxr-xr-x",
      size: 4096,
    });
    const documents = await File.create({
      name: "Documents",
      type: "directory",
      parentId: guest._id,
      permissions: "drwxr-xr-x",
      size: 4096,
    });

    await File.create({
      name: ".motd",
      type: "file",
      parentId: guest._id,
      size: 768,
      permissions: "-rw-r--r--",
      content: `
██╗    ██╗██╗███████╗████████╗███████╗██████╗  ██████╗ ██████╗ ██████╗ ██████╗ 
██║    ██║██║██╔════╝╚══██╔══╝██╔════╝██╔══██╗██╔════╝██╔═══██╗██╔══██╗██╔══██╗
██║ █╗ ██║██║███████╗   ██║   █████╗  ██████╔╝██║     ██║   ██║██████╔╝██████╔╝
██║███╗██║██║╚════██║   ██║   ██╔══╝  ██╔══██╗██║     ██║   ██║██╔══██╗██╔═══╝ 
╚███╔███╔╝██║███████║   ██║   ███████╗██║  ██║╚██████╗╚██████╔╝██║  ██║██║     
 ╚══╝╚══╝ ╚═╝╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝     

[ WARNING ] This system is the private property of WISTERCORP Industries.
All activities are monitored and logged. Unauthorized access will be 
prosecuted to the fullest extent of the law.

System Status: STABLE. Security audit scheduled.
`,
    });

    const sshDir = await File.create({
      name: ".ssh",
      type: "directory",
      parentId: guest._id,
      permissions: "drwx------",
      size: 512,
    });
    await File.create({
      name: "authorized_keys",
      type: "file",
      parentId: sshDir._id,
      permissions: "-rw-------",
      size: randSize(),
      content: "# Keys for admin remote access. DO NOT DELETE.",
    });
    await File.create({
      name: "id_rsa",
      type: "file",
      parentId: sshDir._id,
      permissions: "-rw-------",
      size: randSize(),
      content:
        "-----BEGIN RSA PRIVATE KEY-----\nMIIEogIBAAKCAQEAr... [Key data truncated for brevity] ...\n-----END RSA PRIVATE KEY-----",
    });

    await File.create({
      name: "passwd.shadow",
      type: "file",
      parentId: etc._id,
      permissions: "-r--------",
      owner: "root",
      group: "root",
      size: randSize(),
      content:
        "root:$6$somesalt$NotGonnaCrackThis...:18211:0:99999:7:::\nadmin:$6$anothersalt$EvenLongerHashYouWont...:18212:0:99999:7:::\nguest:$6$yetanother$JustGiveUpAlready...:18212:0:99999:7:::",
    });

    await File.create({
      name: "secure.log",
      type: "file",
      parentId: logDir._id,
      owner: "root",
      group: "root",
      permissions: "-rw-------",
      size: randSize(),
      content:
        "Jul 05 22:10:01 server sshd[25331]: Accepted publickey for admin from 10.1.1.5 port 22\nJul 05 22:10:05 server sudo: admin : TTY=pts/0 ; PWD=/home/guest ; USER=root ; COMMAND=/usr/bin/apt update",
    });

    await File.create({
      name: "user_credentials.txt.bak",
      type: "file",
      parentId: documents._id,
      size: randSize(),
      permissions: "-rw-r--r--",
      content:
        "YWRtaW46UEBzc3cwcmQxMjMh\nZ3Vlc3Q6Z3Vlc3Q=am9obi5kb2U6Q2hhbmdlTWUxMjM=",
    });

    console.log("Final Honeypot filesystem and baits are now active!");
  } catch (error) {
    if (error.code !== 11000) {
      console.error("Error seeding database:", error);
    }
  }
}
