import express from "express";
import { createServer } from "http";
import { exec, execSync } from "child_process";
import cors from "cors";
import fs from "fs";
import { Server } from "socket.io";

import { deleteFilesByExtension } from "./helpers";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

app.use(cors());

app.use("/videos", express.static("videos"));

// setInterval(() => {
//   deleteFilesByExtension(process.cwd() + "/videos/", ".ts", 1);
// }, 10000);

io.on("connection", (socket) => {
  console.log("user connected");

  socket.on("setup-stream", (streamName, rtspUrl) => {
    prepareForStream(streamName, rtspUrl);

    const ffmpegProcess = exec(
      `ffmpeg -i ${rtspUrl} ${process.cwd()}/videos/${streamName}/test.m3u8`
    );

    ffmpegProcess.on("spawn", () => {
      console.log("spawn");
      while (!fs.existsSync(`${process.cwd()}/videos/${streamName}/test.m3u8`))
        setTimeout(() => {}, 4000);
      fs.existsSync(`${process.cwd()}/videos/${streamName}/test.m3u8`) &&
        socket.emit(
          "stream-ready",
          `${streamName}/test.m3u8`,
          ffmpegProcess.pid,
          streamName
        );
    });
  });

  socket.on("stop-stream", (processPid, streamName) => {
    execSync(`kill -9 ${processPid}`);
    while (fs.existsSync(`${process.cwd()}/videos/${streamName}`)) {
      fs.rmSync(`${process.cwd()}/videos/${streamName}`, {
        force: true,
        recursive: true,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

httpServer.listen("3000", () => {
  console.log("runing", process.cwd());
});

function prepareForStream(streamName: string, rtspUrl: string) {
  console.log("entered setuo");

  while (fs.existsSync(`${process.cwd()}/videos/${streamName}`)) {
    fs.rmSync(`${process.cwd()}/videos/${streamName}`, {
      force: true,
      recursive: true,
    });
  }
  fs.mkdirSync(`${process.cwd()}/videos/${streamName}`, { recursive: true });
}
