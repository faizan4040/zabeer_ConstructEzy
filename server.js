const { createServer } = require("http");
const { parse }        = require("url");
const next             = require("next");
const { Server }       = require("socket.io");
const mongoose         = require("mongoose");


const dev  = process.env.NODE_ENV !== "production";
const app  = next({ dev });
const handle = app.getRequestHandler();
const PORT = process.env.PORT || 3000;

// ── Mongoose connection ──────────────────────────────────────────────────────
async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(" MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

// ── Schemas ──────────────────────────────────────────────────────────────────
const MessageSchema = new mongoose.Schema(
  {
    roomId:      { type: mongoose.Schema.Types.ObjectId, ref: "ChatRoom", required: true, index: true },
    senderType:  { type: String, enum: ["user", "admin"], required: true },
    senderId:    { type: mongoose.Schema.Types.ObjectId, required: true },
    // message is no longer required — file messages have fileUrl instead
    message:     { type: String, trim: true, default: "" },
    // new fields for file/image support
    messageType: { type: String, enum: ["text", "image", "file"], default: "text" },
    fileUrl:     { type: String, default: null },   // Cloudinary secure_url
    fileName:    { type: String, default: null },   // original filename
    fileType:    { type: String, default: null },   // mime type e.g. image/jpeg
    isRead:      { type: Boolean, default: false },
  },
  { timestamps: true }
);

const ChatRoomSchema = new mongoose.Schema(
  {
    userId:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    adminId:       { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    lastMessage:   { type: String, default: "" },
    lastMessageAt: { type: Date, default: Date.now },
    isOpen:        { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Message  = mongoose.models.Message  || mongoose.model("Message",  MessageSchema);
const ChatRoom = mongoose.models.ChatRoom || mongoose.model("ChatRoom", ChatRoomSchema);

const onlineUsers = new Map();

// ── Boot ─────────────────────────────────────────────────────────────────────
app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: {
      origin:      process.env.NEXT_PUBLIC_APP_URL || "*",
      methods:     ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
    // allow larger payloads for file uploads via socket (base64)
    maxHttpBufferSize: 5 * 1024 * 1024, // 5 MB
  });

  // API routes (lib/realtime.js) isi instance se live job updates bhejte hain
  globalThis.__io = io;

  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // ── Register online ──────────────────────────────────────────────────────
    socket.on("user-online", ({ userId, role }) => {
      onlineUsers.set(userId, socket.id);
      socket.data.userId = userId;
      socket.data.role   = role;
      io.emit("presence-update", { userId, status: "online" });
      console.log(`👤 ${role} online: ${userId}`);
    });

    // ── Join room ────────────────────────────────────────────────────────────
    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      console.log(`📌 Socket ${socket.id} joined room: ${roomId}`);
    });

    // ── Typing ───────────────────────────────────────────────────────────────
    socket.on("typing", ({ roomId, senderType }) => {
      socket.to(roomId).emit("user-typing", { roomId, senderType });
    });

    socket.on("stop-typing", ({ roomId, senderType }) => {
      socket.to(roomId).emit("user-stop-typing", { roomId, senderType });
    });

    // ── Text message ─────────────────────────────────────────────────────────
    socket.on("send-message", async (data) => {
      const { roomId, senderType, senderId, message } = data;

      if (!roomId || !senderType || !senderId || !message?.trim()) {
        socket.emit("error", { message: "Invalid message payload" });
        return;
      }

      try {
        await connectDB();

        const msg = await Message.create({
          roomId,
          senderType,
          senderId:    new mongoose.Types.ObjectId(senderId),
          message:     message.trim(),
          messageType: "text",
        });

        await ChatRoom.findByIdAndUpdate(roomId, {
          lastMessage:   message.trim(),
          lastMessageAt: new Date(),
        });

        const payload = {
          _id:         msg._id.toString(),
          roomId:      roomId.toString(),
          senderType,
          senderId:    senderId.toString(),
          message:     msg.message,
          messageType: "text",
          fileUrl:     null,
          fileName:    null,
          fileType:    null,
          isRead:      false,
          createdAt:   msg.createdAt,
        };

        io.to(roomId).emit("receive-message", payload);
        io.emit("room-updated", {
          roomId,
          lastMessage:   message.trim(),
          lastMessageAt: new Date(),
          senderType,
        });

        console.log(`[${senderType}] room ${roomId}: ${message.trim()}`);
      } catch (err) {
        console.error("❌ send-message error:", err.message);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // File/Image message (URL already uploaded via /api/chat/upload) ────
    socket.on("send-file-message", async (data) => {
      const { roomId, senderType, senderId, fileUrl, fileName, fileType } = data;

      if (!roomId || !senderType || !senderId || !fileUrl) {
        socket.emit("error", { message: "Invalid file message payload" });
        return;
      }

      try {
        await connectDB();

        const isImage   = fileType?.startsWith("image/");
        const msgType   = isImage ? "image" : "file";
        const preview   = isImage ? "📷 Image" : `📎 ${fileName || "File"}`;

        const msg = await Message.create({
          roomId,
          senderType,
          senderId:    new mongoose.Types.ObjectId(senderId),
          message:     preview,
          messageType: msgType,
          fileUrl,
          fileName:    fileName || "",
          fileType:    fileType || "",
        });

        await ChatRoom.findByIdAndUpdate(roomId, {
          lastMessage:   preview,
          lastMessageAt: new Date(),
        });

        const payload = {
          _id:         msg._id.toString(),
          roomId:      roomId.toString(),
          senderType,
          senderId:    senderId.toString(),
          message:     preview,
          messageType: msgType,
          fileUrl,
          fileName:    fileName || "",
          fileType:    fileType || "",
          isRead:      false,
          createdAt:   msg.createdAt,
        };

        io.to(roomId).emit("receive-message", payload);
        io.emit("room-updated", {
          roomId,
          lastMessage:   preview,
          lastMessageAt: new Date(),
          senderType,
        });

        console.log(`[${senderType}] room ${roomId}: file → ${fileName}`);
      } catch (err) {
        console.error("❌ send-file-message error:", err.message);
        socket.emit("error", { message: "Failed to send file message" });
      }
    });

    // ── Mark read ────────────────────────────────────────────────────────────
    socket.on("mark-read", async ({ roomId, readerType }) => {
      try {
        await connectDB();
        const senderFilter = readerType === "admin" ? "user" : "admin";
        await Message.updateMany(
          { roomId, senderType: senderFilter, isRead: false },
          { isRead: true }
        );
        io.to(roomId).emit("messages-read", { roomId, readerType });
      } catch (err) {
        console.error("❌ mark-read error:", err.message);
      }
    });

    // ── Disconnect ───────────────────────────────────────────────────────────
    socket.on("disconnect", () => {
      const userId = socket.data.userId;
      if (userId) {
        onlineUsers.delete(userId);
        io.emit("presence-update", { userId, status: "offline" });
        console.log(`🔴 ${socket.data.role || "user"} offline: ${userId}`);
      }
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running → http://localhost:${PORT}`);
  });
});











