const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const File = require("./models/file");
const commandRoutes = require("./routes/command");

const app = express();
const PORT = 3000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://mongo:27017/terminaldb";

app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.set("trust proxy", true);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Successfully connected to MongoDB.");
    seedDatabase();
  })
  .catch((err) => console.error("Connection error", err));

app.use("/api", commandRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

async function seedDatabase() {
  try {
    const count = await File.countDocuments();
    if (count > 0) {
      console.log("Filesystem already exists. Skipping seed.");
      return;
    }

    console.log(
      "Seeding filesystem with your new detailed portfolio structure..."
    );

    const randSize = () => Math.floor(Math.random() * 2048) + 100;

    // --- DIREKTORI SISTEM (TETAP ADA SESUAI PERMINTAAN) ---
    const root = await File.create({
      name: "/",
      type: "directory",
      parentId: null,
      permissions: "drwxr-xr-x",
      size: 4096,
    });
    await File.create({
      name: "bin",
      type: "directory",
      parentId: root._id,
      permissions: "drwxr-xr-x",
      size: 4096,
    });
    await File.create({
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
    await File.create({
      name: "log",
      type: "directory",
      parentId: varDir._id,
      permissions: "drwxr-xr-x",
      size: 4096,
    });

    // --- STRUKTUR /home/guest YANG BARU ---
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

    // File dasar di /home/guest
    await File.create({
      name: ".motd",
      type: "file",
      parentId: guest._id,
      size: 768,
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

Type "help" for a list of approved commands.
`,
    });
    await File.create({
      name: ".ssh",
      type: "directory",
      parentId: guest._id,
      permissions: "drwx------",
      size: 512,
    });
    await File.create({
      name: "README.md",
      type: "file",
      parentId: guest._id,
      size: randSize(),
      content: `

===========================
  SUMMARY
===========================

CS Student with a professional working experience in DevOps, Backend Development and Network Infrastructure.
trusted to lead System Administrator Documentation in National-Level project for REN ( Research Education
Network ) by the Campus Network Engineer. Actively contributing in OS and Backend Development as a teacher in
IT communities. Continually exploring technologies used in Cloud Computing, DevOps,  CI/CD While implementing
laboratory project. Currently looking for a DevOps / Network Engineering / Cybersecurity internship to expand my contributions
more and deliver greater solutions for thepublic community.

maybe my portofolio mostly are cloud computing and network related,
but I've recently picked a new hobby: cybersecurity. This terminal is the result.

It's filled with standard commands and... a few "undocumented features." Consider it a game.
Some doors open as expected, some are locked, and some might just lead to a Rickroll.
Go on, try 'rm -rf *' or 'ssh' if you feel lucky. :3

===========================
  RECCOMENDATIONS
===========================
Always check the .txt first guys !
/home/guest/tree.txt
/home/guest/contact.txt
/home/guest/certificates/public_profile.txt

`,
    });
    await File.create({
      name: "tree.txt",
      type: "file",
      parentId: guest._id,
      size: randSize(),
      content: `

===========================
  TREE
===========================
This is the "main" file structure of my web

/home/guest/
├── .motd                 
├── .ssh/                 
│
├── README.md             
├── Projects/
│   ├── freshgrade.txt
│   └── pastebox.txt
│
├── Documents/            
│   ├── Work_Experience
│   │     └── Filkom_UB
│   │        ├── operating_system.pdf
│   │        └── network.pdf
│   ├── Programs
│   │    ├── MSIB
│   │    │   └── certificate.pdf
│   │    ├── Bangkit
│   │    │   ├── distinction_Letter.pdf
│   │    │   ├── english_for_bussiness_communication.pdf 
│   │    │   ├── interim_transcript.pdf
│   │    │   └── certificate_of_completion.pdf
│   │    └── APIE
│   │        └── blended_learning.pdf
│   ├── Volunteer
│   │    ├── Orientation_Assistant.pdf
│   │    └── IT_Gemastik_XVI.pdf
│   └── education.txt
│
├── Certificates/
│   ├── Dicoding
│   │   ├── Google_cloud_professional
│   │   │     ├── BDGC_basic.pdf
│   │   │     ├── BDPJ_basic.pdf
│   │   │     ├── BEGC_basic.pdf
│   │   │     └── MGCE_intermediate.pdf
│   │   ├── Devops_Engineer
│   │   │     ├── BDDD_basic.pdf
│   │   │     ├── BJKUP_basic.pdf
│   │   │     ├── MLSA_intermediate.pdf
│   │   │     ├── BICICD_intermediate.pdf
│   │   │     └── BMAM_proficient.pdf
│   │   └── Backend_Engineer
│   │         ├── BDGC_basic.pdf
│   │         ├── BDPJ_basic.pdf
│   │         ├── BEGC_basic.pdf
│   │         └── MGCE_intermediate.pdf
│   ├── Cisco
│   │   ├── Cybersec.pdf
│   │   ├── Networking_Basics.pdf
│   │   └── Networking_Devices_Config.pdf
│   ├── Microsoft
│   │   └── SC_900.pdf
│   ├── SOI
│   │   └── blended_learning.pdf
│   ├── COURSERA
│   │    ├── Google_IT_Support.pdf
│   │    └── Google_Cybersecurity.pdf
│   ├── APNIC
│   │    └── Routing_fundamentals.pdf
│   └── public_profile.txt
├── contact.txt
└── Organizations
    └── POROS 
        └── statement_of_organizational_activity.pdf

      `,
    });

    await File.create({
      name: "contact.txt",
      type: "file",
      parentId: guest._id,
      size: randSize(),
      content: `

===========================
  CONTACT INFORMATION
===========================

Name        : Afwan Mulia Pratama
Email       : afwanmp@gmail.com
Phone       : [+62-xxx-xxxx-xxxx]
Website     : https://afwanmp.my.id
GitHub      : https://github.com/Afwann
LinkedIn    : https://linkedin.com/in/afwanmp

===========================
  LOCATION
===========================

City        : [Malang / Jakarta, Indonesia]
Time Zone   : [GMT+7 (WIB)]

===========================
  AVAILABILITY
===========================

Available for collaboration, freelance projects, and full-time opportunities.
Feel free to reach out via email.

`,
    });

    // /home/guest/Projects
    const projectsDir = await File.create({
      name: "Projects",
      type: "directory",
      parentId: guest._id,
      permissions: "drwxr-xr-x",
      size: 512,
    });
    await File.create({
      name: "freshgrade.txt",
      type: "file",
      parentId: projectsDir._id,
      size: randSize(),
      content: `

===========================
  FRESHGRADE
===========================

The FreshGrade backend is built using the Express.js framework from Node.js.
It provides RESTful APIs for:

- User authentication
- Data management
- Communication with the machine learning model for fruit condition recognition

Learn more about FreshGrade at:
https://github.com/Bangkit-FreshGrade/freshgrade-backend

`,
    });
    await File.create({
      name: "pastebox.txt",
      type: "file",
      parentId: projectsDir._id,
      size: randSize(),
      content: `

===========================
  PASTEBOX
===========================

PasteBox is a full-stack MERN (MongoDB, Express.js, React, Node.js) application 
designed for storing and sharing code snippets.

Key Features:
-------------
- User registration and authentication
- Create, edit, and delete code snippets
- Set snippet visibility: **Public** (shareable) or **Private**
- View other users' public profiles and snippets

DevSecOps & CI/CD Integration:
------------------------------
- CI/CD pipeline using **Jenkins**
- GitHub integration with webhook triggers (GitHub Webhooks)
- Static Application Security Testing (SAST) via **SonarQube**
- Dynamic Application Security Testing (DAST) via **OWASP ZAP**

Tech Stack:
-----------
- Frontend: React.js
- Backend: Node.js with Express.js
- Database: MongoDB
- DevOps: Jenkins, GitHub
- Security Testing: SonarQube (SAST), OWASP ZAP (DAST)

Repository:
-----------
https://github.com/Afwann/PasteBox

Author Fullstack & DevSecOps:
-----------------------------
Afwan Mulia Pratama

`,
    });

    // /home/guest/Documents
    const documentsDir = await File.create({
      name: "Documents",
      type: "directory",
      parentId: guest._id,
      permissions: "drwxr-xr-x",
      size: 4096,
    });
    await File.create({
      name: "education.txt",
      type: "file",
      parentId: documentsDir._id,
      size: randSize(),
      content: `

===========================
Education History
===========================
Universitas Brawijaya, Computer Science [2021 - Present]
SMA Negeri 82 Jakarta, Science [2018 - 2021]

`,
    });

    // /home/guest/Documents/Work_Experience
    const workExpDir = await File.create({
      name: "Work_Experience",
      type: "directory",
      parentId: documentsDir._id,
      permissions: "drwxr-xr-x",
      size: 512,
    });
    const filkomDir = await File.create({
      name: "Filkom_UB",
      type: "directory",
      parentId: workExpDir._id,
      permissions: "drwxr-xr-x",
      size: 512,
    });
    await File.create({
      name: "operating_system.pdf",
      type: "file",
      parentId: filkomDir._id,
      size: randSize(),
      url: "/files/operating_system.pdf",
    });
    await File.create({
      name: "network.pdf",
      type: "file",
      parentId: filkomDir._id,
      size: randSize(),
      url: "/files/network.pdf",
    });

    // /home/guest/Documents/Programs
    const programsDir = await File.create({
      name: "Programs",
      type: "directory",
      parentId: documentsDir._id,
      permissions: "drwxr-xr-x",
      size: 1024,
    });
    const msibDir = await File.create({
      name: "MSIB",
      type: "directory",
      parentId: programsDir._id,
      permissions: "drwxr-xr-x",
      size: 512,
    });
    await File.create({
      name: "certificate.pdf",
      type: "file",
      parentId: msibDir._id,
      size: randSize(),
      url: "/files/certificate.pdf",
    });

    const bangkitDir = await File.create({
      name: "Bangkit",
      type: "directory",
      parentId: programsDir._id,
      permissions: "drwxr-xr-x",
      size: 512,
    });
    await File.create({
      name: "distinction_Letter.pdf",
      type: "file",
      parentId: bangkitDir._id,
      size: randSize(),
      url: "/files/distinction_Letter.pdf",
    });
    await File.create({
      name: "english_for_bussiness_communication.pdf",
      type: "file",
      parentId: bangkitDir._id,
      size: randSize(),
      url: "/files/english_for_bussiness_communication.pdf",
    });
    await File.create({
      name: "interim_transcript.pdf",
      type: "file",
      parentId: bangkitDir._id,
      size: randSize(),
      url: "/files/interim_transcript.pdf",
    });
    await File.create({
      name: "certificate_of_completion.pdf",
      type: "file",
      parentId: bangkitDir._id,
      size: randSize(),
      url: "/files/certificate_of_completion.pdf",
    });

    const apieDir = await File.create({
      name: "APIE",
      type: "directory",
      parentId: programsDir._id,
      permissions: "drwxr-xr-x",
      size: 512,
    });
    await File.create({
      name: "blended_learning.pdf",
      type: "file",
      parentId: apieDir._id,
      size: randSize(),
      url: "/files/blended_learning.pdf",
    });

    // /home/guest/Documents/Volunteer
    const volunteerDir = await File.create({
      name: "Volunteer",
      type: "directory",
      parentId: documentsDir._id,
      permissions: "drwxr-xr-x",
      size: 1024,
    });
    await File.create({
      name: "Orientation_Assistant.pdf",
      type: "file",
      parentId: volunteerDir._id,
      size: randSize(),
      url: "/files/Orientation_Assistant.pdf",
    });
    await File.create({
      name: "IT_Gemastik_XVI.pdf",
      type: "file",
      parentId: volunteerDir._id,
      size: randSize(),
      url: "/files/IT_Gemastik_XVI.pdf",
    });

    // /home/guest/Certificates
    const certificatesDir = await File.create({
      name: "Certificates",
      type: "directory",
      parentId: guest._id,
      permissions: "drwxr-xr-x",
      size: 2048,
    });
    await File.create({
      name: "public_profile.txt",
      type: "file",
      parentId: certificatesDir._id,
      size: randSize(),
      content: `

===========================
  CERTIFICATES INFO
===========================

I’ve collected quite a few certificates from various platforms.  
I know it might be a bit much to download them one by one *,
so if you’re interested in seeing or collecting all of them at once,
just reach out to me — I haven’t built a download link for that yet.

* you can download it with the button after command "open <file_name>"

===========================
  PUBLIC PROFILES
===========================

Coursera                 : https://www.coursera.org/user/25e68826db3f1ec5a597a34f8ee2eabf  
Dicoding                 : https://www.dicoding.com/users/afwan_mp/academies  
Google Cloud Skill Boost : https://www.cloudskillsboost.google/public_profiles/db471e45-8fdb-4a50-9c56-7487abacfab0  
Cisco Networking Academy : (No public profile available yet)
Microsoft Learn          : (No public profile available yet)
APNIC Academy            : (No public profile available yet)

`,
    });

    // --- BAGIAN DICODING YANG DILENGKAPI ---
    const dicodingDir = await File.create({
      name: "Dicoding",
      type: "directory",
      parentId: certificatesDir._id,
      permissions: "drwxr-xr-x",
      size: 1024,
    });

    const gcpDir = await File.create({
      name: "Google_cloud_professional",
      type: "directory",
      parentId: dicodingDir._id,
      permissions: "drwxr-xr-x",
      size: 512,
    });
    await File.create({
      name: "BDPJ_basic.pdf",
      type: "file",
      parentId: gcpDir._id,
      size: randSize(),
      url: "/files/BDPJ_basic.pdf",
    });
    await File.create({
      name: "BEGC_beginner.pdf",
      type: "file",
      parentId: gcpDir._id,
      size: randSize(),
      url: "/files/BEGC_beginner.pdf",
    });
    await File.create({
      name: "MGCE_intermediate.pdf",
      type: "file",
      parentId: gcpDir._id,
      size: randSize(),
      url: "/files/MGCE_intermediate.pdf",
    });

    const devopsDir = await File.create({
      name: "Devops_Engineer",
      type: "directory",
      parentId: dicodingDir._id,
      permissions: "drwxr-xr-x",
      size: 512,
    });
    await File.create({
      name: "BDDD_basic.pdf",
      type: "file",
      parentId: devopsDir._id,
      size: randSize(),
      url: "/files/BDDD_basic.pdf",
    });
    await File.create({
      name: "BJKUP_beginner.pdf",
      type: "file",
      parentId: devopsDir._id,
      size: randSize(),
      url: "/files/BJKUP_beginner.pdf",
    });
    await File.create({
      name: "MLSA_intermediate.pdf",
      type: "file",
      parentId: devopsDir._id,
      size: randSize(),
      url: "/files/MLSA_intermediate.pdf",
    });
    await File.create({
      name: "BICICD_intermediate.pdf",
      type: "file",
      parentId: devopsDir._id,
      size: randSize(),
      url: "/files/BICICD_intermediate.pdf",
    });
    await File.create({
      name: "BMAM_proficient.pdf",
      type: "file",
      parentId: devopsDir._id,
      size: randSize(),
      url: "/files/BMAM_proficient.pdf",
    });

    const backendDir = await File.create({
      name: "Backend_Engineer",
      type: "directory",
      parentId: dicodingDir._id,
      permissions: "drwxr-xr-x",
      size: 512,
    });
    await File.create({
      name: "BDGC_basic.pdf",
      type: "file",
      parentId: backendDir._id,
      size: randSize(),
      url: "/files/BDGC_basic.pdf",
    });
    await File.create({
      name: "BDPJ_basic.pdf",
      type: "file",
      parentId: backendDir._id,
      size: randSize(),
      url: "/files/BDPJ_basic.pdf",
    });
    await File.create({
      name: "BBEPJ_beginner.pdf",
      type: "file",
      parentId: backendDir._id,
      size: randSize(),
      url: "/files/BBEPJ_beginner.pdf",
    });

    const ciscoDir = await File.create({
      name: "Cisco",
      type: "directory",
      parentId: certificatesDir._id,
      permissions: "drwxr-xr-x",
      size: 512,
    });
    await File.create({
      name: "Cybersec.pdf",
      type: "file",
      parentId: ciscoDir._id,
      size: randSize(),
      url: "/files/Cybersec.pdf",
    });
    await File.create({
      name: "Networking_Basics.pdf",
      type: "file",
      parentId: ciscoDir._id,
      size: randSize(),
      url: "/files/Networking_Basics.pdf",
    });
    await File.create({
      name: "Networking_Devices_Config.pdf",
      type: "file",
      parentId: ciscoDir._id,
      size: randSize(),
      url: "/files/Networking_Devices_Config.pdf",
    });

    const msftDir = await File.create({
      name: "Microsoft",
      type: "directory",
      parentId: certificatesDir._id,
      permissions: "drwxr-xr-x",
      size: 512,
    });
    await File.create({
      name: "SC_900.pdf",
      type: "file",
      parentId: msftDir._id,
      size: randSize(),
      url: "/files/SC_900.pdf",
    });

    const soiDir = await File.create({
      name: "SOI",
      type: "directory",
      parentId: certificatesDir._id,
      permissions: "drwxr-xr-x",
      size: 512,
    });
    await File.create({
      name: "blended_learning.pdf",
      type: "file",
      parentId: soiDir._id,
      size: randSize(),
      url: "/files/blended_learning.pdf",
    });

    const courseraDir = await File.create({
      name: "Coursera",
      type: "directory",
      parentId: certificatesDir._id,
      permissions: "drwxr-xr-x",
      size: 512,
    });
    await File.create({
      name: "Google_IT_Support.pdf",
      type: "file",
      parentId: courseraDir._id,
      size: randSize(),
      url: "/files/Google_IT_Support.pdf",
    });
    await File.create({
      name: "Google_Cybersecurity.pdf",
      type: "file",
      parentId: courseraDir._id,
      size: randSize(),
      url: "/files/Google_Cybersecurity.pdf",
    });

    const apnicDir = await File.create({
      name: "APNIC",
      type: "directory",
      parentId: certificatesDir._id,
      permissions: "drwxr-xr-x",
      size: 512,
    });
    await File.create({
      name: "Routing_fundamentals.pdf",
      type: "file",
      parentId: apnicDir._id,
      size: randSize(),
      url: "/files/Routing_fundamentals.pdf",
    });

    // /home/guest/Organizations
    const organizationsDir = await File.create({
      name: "Organizations",
      type: "directory",
      parentId: guest._id,
      permissions: "drwxr-xr-x",
      size: 512,
    });
    const porosDir = await File.create({
      name: "POROS",
      type: "directory",
      parentId: organizationsDir._id,
      permissions: "drwxr-xr-x",
      size: 512,
    });
    await File.create({
      name: "statement_of_organizational_activity.pdf",
      type: "file",
      parentId: porosDir._id,
      size: randSize(),
      url: "/files/statement_of_organizational_activity.pdf",
    });

    console.log("New portfolio structure has been successfully seeded!");
  } catch (error) {
    if (error.code !== 11000) {
      console.error("Error seeding database:", error);
    }
  }
}
