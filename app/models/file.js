const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["file", "directory"], required: true },
  content: { type: String, default: "" },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "File",
    default: null,
  },

  permissions: { type: String, default: "-rw-r--r--" },
  owner: { type: String, default: "guest" },
  group: { type: String, default: "guest" },
  size: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

fileSchema.index({ parentId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("File", fileSchema);
