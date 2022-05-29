import React from "react";

import ReactPlayer from "react-player";
import { io } from "socket.io-client";

import "./App.css";

const socket = io("localhost:3000");
function App() {
  const [streamName, setStreamName] = React.useState("");
  const [rtspUrl, setTtspUrl] = React.useState("");
  const [streamProcess, setStreamProcess] = React.useState<
    {
      url: string;
      pid: number;
      name: string;
    }[]
  >([]);
  // const streamName = "myStream";
  // const rtspUrl = "rtsp://rtsp.stream/pattern";
  socket.on("connect", () => {
    console.log(`You are connected with id ${socket.id}`);
  });
  socket.on("stream-ready", (streamUrl, process, name) => {
    console.log(streamUrl);

    setStreamProcess([
      ...streamProcess,
      {
        pid: process,
        url: streamUrl,
        name,
      },
    ]);
  });

  return (
    <React.Fragment>
      <div>
        <h2>Stream name</h2>
        <input
          type="text"
          onChange={(e) => setStreamName(e.target.value)}
          placeholder="stream name"
        />
      </div>
      <div>
        <h2>RTSP Stream</h2>
        <input
          type="text"
          onChange={(e) => setTtspUrl(e.target.value)}
          placeholder="stream name"
        />
      </div>
      <button
        onClick={(e) => {
          e.preventDefault();
          socket.emit("setup-stream", streamName, rtspUrl);
        }}
      >
        start
      </button>

      {streamProcess.length > 0 &&
        streamProcess.map((process) => (
          <div key={process.url}>
            <ReactPlayer
              url={`http://localhost:3000/videos/${process.url}`}
              playing={true}
            />
            <button
              onClick={(e) => {
                e.preventDefault();
                socket.emit("stop-stream", process.pid, process.name);
                setStreamProcess(
                  streamProcess.filter((p) => p.url !== process.url)
                );
              }}
            >
              Stop stream
            </button>
          </div>
        ))}
    </React.Fragment>
  );
}

export default App;
