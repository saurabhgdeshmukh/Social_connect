import React, { useEffect, useRef, useState, createContext } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import micmute from "../assets/micmute.svg";
import micunmute from "../assets/micunmute.svg";
import webcam from "../assets/webcam.svg";
import webcamoff from "../assets/webcamoff.svg";
import "./Room.css";
import { useLocation } from "react-router-dom";
import Chat from './Chat';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import {
  faVideo,
  faMicrophone,
  faPhone,
  faVideoSlash,
  faAngleUp,
  faClosedCaptioning,
  faDesktop,
  faMicrophoneSlash,
  faCircleInfo,
  faMessage,
  faArrowUpFromBracket,
  faUsers,
  faRecordVinyl,
  faPause,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

export const RoomDet = createContext();

const Video = (props) => {
  const ref = useRef();

  useEffect(() => {
    props.peer.on("stream", (stream) => {
      ref.current.srcObject = stream;
    });
  }, []);

  return <video className="StyledVideo" playsInline autoPlay ref={ref} />;
};

const Room = (props) => {
  const location = useLocation();
  const [peers, setPeers] = useState([]);
  const [shares, setShares] = useState([]);
  const [audioFlag, setAudioFlag] = useState(true);
  const [videoFlag, setVideoFlag] = useState(true);
  const [userUpdate, setUserUpdate] = useState([]);
  const [username, setUsername] = useState();
  const [callername, setCallername] = useState();
  const [stream, setStream] = useState();
  const [screensharestat, setScreenShareStat] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recording = [];
  const navigate = useNavigate();
  const [showChat, setshowChat] = useState(false);

  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);
  const shareRef = useRef([]);
  const senders = useRef();
  let mediaRecorder;

  const params = new URLSearchParams(location.search);
  const roomID = params.get("roomID");
  localStorage.setItem("roomData", roomID);

  const videoConstraints = {
    minAspectRatio: 1.333,
    minFrameRate: 60,
    height: window.innerHeight / 1.8,
    width: window.innerWidth / 2,
  };

  useEffect(async () => {
    socketRef.current = io.connect("/");
    const stream = await navigator.mediaDevices.getUserMedia({
      video: videoConstraints,
      audio: true,
    });
    setStream(stream);
    userVideo.current.srcObject = stream;
    const name = localStorage.getItem("email");
    setUsername(name);
    console.log(name);

    const loggedusername = localStorage.getItem("username");

    const loggeduserpic = localStorage.getItem("userpic");

    localStorage.clear();
    socketRef.current.emit("join room", roomID);
    console.log(`inviting to room ${roomID}`);

    socketRef.current.on("all users", (users) => {
      console.log(users);
      const peers = [];
      users.forEach((userID) => {
        const peer = createPeer(userID, socketRef.current.id, stream);
        peersRef.current.push({
          peerID: userID,
          peer,
        });
        peers.push({
          peerID: userID,
          peer,
        });
      });
      setPeers(peers);
    });

    const datauser = {
      roomid: roomID,
      uid: socketRef.current.id,
      name: loggedusername,
      picture: loggeduserpic,
    };
    localStorage.setItem("currUser", socketRef.current.id);
    const url = "http://localhost:8000/" + roomID;
    console.log(url);
    fetch(url, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(datauser),
    })
      // .then((response) => response.json())
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.error(error);
      });

    socketRef.current.on("all users ID", (users) => {
      console.log(1);
      console.log(users);
      users.forEach((userID) => {
        localStorage.setItem(
          "user",
          JSON.stringify({
            name: loggedusername,
            picture: loggeduserpic,
            userid: userID,
          })
        );
        console.log(localStorage);
      });
    });

    socketRef.current.on("user joined", (payload) => {
      console.log("==", payload);
      console.log("user joined");
      const peer = addPeer(payload.signal, payload.callerID, stream);
      peersRef.current.push({
        peerID: payload.callerID,
        peer,
      });
      const peerObj = {
        peer,
        peerID: payload.callerID,
      };
      setPeers((users) => [...users, peerObj]);
    });

    socketRef.current.on("user left", (id) => {
      console.log(`user left: ${id}`);
      const peerObj = peersRef.current.find((p) => p.peerID === id);
      console.log(peerObj);
      try {
        if (peerObj) {
          peerObj.peer.destroy((err) => {
            console.log(err);
          });
        }
        const peers = peersRef.current.filter((p) => p.peerID !== id);
        peersRef.current = peers;
        setPeers(peers);
      } catch (e) {
        console.log(e);
      }
    });

    socketRef.current.on("receiving returned signal", (payload) => {
      console.log("receiving returned signal");
      const item = peersRef.current.find((p) => p.peerID === payload.id);
      item.peer.signal(payload.signal);
    });

    socketRef.current.on("change", (payload) => {
      console.log("change");
      setUserUpdate(payload);
    });

    /*socketRef.current.on("send to", async (users) => {
      const screen = await navigator.mediaDevices.getDisplayMedia({ cursor: true })
      const screenTrack = screen.getTracks()[0];
      setScreenShareStat(true);
      senders.current.srcObject = screen;
      console.log(users);
      users.forEach((userID) => {
            const share = createShare(userID, socketRef.current.id, screen);
            shareRef.current.push({
              shareID: userID,
              share,
            });
            shares.push({
              shareID: userID,
              share,
            });
          })
          setShares(shares);
        })

    socketRef.current.on("screen shared", payload => {
      peers.map(peer => {
        if(peer.peerID == payload.callerID){
          const callerID = payload.callerID;  
          peer.on("signal", signal => {
            socketRef.current.emit("returning share signal", {signal, callerID});
          })

          peer.signal(payload.signal);
        }
      })
    });

    socketRef.current.on("receiving returned share signal", (payload) => {
      console.log("receiving returned share signal");
      const item = shareRef.current.find((p) => p.shareID === payload.id);
      item.share.signal(payload.signal);
    });*/

    /*socketRef.current.on("shared screen", payload => {
      console.log("recieved sharing");
      peers.map(peer => {
        if(peer.peerID === payload.caller){
          peer.peer.stream = payload.screen;
        }
      })
    })*/
    console.log("stream sent");
  }, []);

  function createPeer(userToSignal, callerID, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      console.log("sending signal");
      socketRef.current.emit("sending signal", {
        userToSignal,
        callerID,
        signal,
      });
    });

    return peer;
  }

  function addPeer(incomingSignal, callerID, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      console.log("returning signal");
      socketRef.current.emit("returning signal", { signal, callerID });
    });

    peer.signal(incomingSignal);

    return peer;
  }

  /*function createShare(userToSignal, senderID, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", signal => {
      socketRef.current.emit("sending share", {userToSignal, senderID, signal})
    });

    return peer;
  }*/

  /*useEffect(() => {
    peers.map((p) => {
      p.peer.stream = stream;
    });
    console.log("changing stream");
    //socketRef.current.emit("sharing screen", {roomID, stream});
    console.log("sending stream");
  }, [screensharestat]);*/

  /*const ShareScreen = async () => {
    const screen = await navigator.mediaDevices.getDisplayMedia({
      cursor: true,
    });

    const screenTrack = screen.getTracks()[0];

    peers.map((p) => {
      p.peer.removeStream(stream);
      p.peer.addStream(screen);
    });
    setStream(screen);

    /*userVideo.current.srcObject.getTracks().forEach(track => {
      if(track.kind === "video"){
        socketRef.current.emit("change", [
          ...userUpdate, {
            id: socketRef.current.id,
            track: screen
          }
        ])
      }
    })
    userVideo.current.srcObject = screen;

    setScreenShareStat(true);
    console.log("screen sharing started in main");
    /*peers.map((p) => {
      p.peer.stream = screen;
    });

    //socketRef.current.emit("sharing screen", roomID);
    //console.log("requested for user list");
    screenTrack.onended = async function () {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: true,
      });
      setStream(stream);
      /*userVideo.current.srcObject.getTracks().forEach(track => {
        if(track.kind === "video"){
          socketRef.current.emit("change", [
            ...userUpdate, {
              id: socketRef.current.id,
              track: stream
            }
          ])
        }
      })

      peers.map((p) => {
        p.peer.removeStream(screen);
        p.peer.addStream(stream);
      });

      userVideo.current.srcObject = stream;
      setScreenShareStat(false);
      /*peers.map(async (p) => {
        p.peer.stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: true,
        });
      });
      // senders.current.find(sender=> sender.track.kind==='video').replaceTrack(userVideo.current.getTracks()(1));
    };
  };*/

  const RecordMeeting = () => {
    navigator.mediaDevices
      .getDisplayMedia({
        cursor: true,
      })
      .then((stream) => {
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start(1000);
        mediaRecorder.ondataavailable = (e) => {
          recording.push(e.data);
        };
      });
  };

  const StopRecordMeeting = () => {
    mediaRecorder.stop();
    const blob = new Blob(recording, {
      type: "video/webm",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    a.href = url;
    a.download = `meetingrecording-${roomID}.webm`;
    a.click();
  };

  return (
    <div className="Callpage-item">
      <div className="Container">
        <div className="videos">
          <div className="VideoContainer">
            <video
              className="StyledVideo"
              muted
              ref={userVideo}
              autoPlay
              playsInline
            />
            {!screensharestat && (
              <div className="Controls">
                <img
                  className="ImgComponent"
                  src={videoFlag ? webcam : webcamoff}
                  onClick={() => {
                    if (userVideo.current.srcObject) {
                      userVideo.current.srcObject
                        .getTracks()
                        .forEach(function (track) {
                          if (track.kind === "video") {
                            if (track.enabled) {
                              socketRef.current.emit("change", [
                                ...userUpdate,
                                {
                                  id: socketRef.current.id,
                                  videoFlag: false,
                                  audioFlag,
                                },
                              ]);
                              track.enabled = false;
                              setVideoFlag(false);
                            } else {
                              socketRef.current.emit("change", [
                                ...userUpdate,
                                {
                                  id: socketRef.current.id,
                                  videoFlag: true,
                                  audioFlag,
                                },
                              ]);
                              track.enabled = true;
                              setVideoFlag(true);
                            }
                          }
                        });
                    }
                  }}
                />
                &nbsp;&nbsp;&nbsp;
                <img
                  className="ImgComponent"
                  src={audioFlag ? micunmute : micmute}
                  onClick={() => {
                    if (userVideo.current.srcObject) {
                      userVideo.current.srcObject
                        .getTracks()
                        .forEach(function (track) {
                          if (track.kind === "audio") {
                            if (track.enabled) {
                              socketRef.current.emit("change", [
                                ...userUpdate,
                                {
                                  id: socketRef.current.id,
                                  videoFlag,
                                  audioFlag: false,
                                },
                              ]);
                              track.enabled = false;
                              setAudioFlag(false);
                            } else {
                              socketRef.current.emit("change", [
                                ...userUpdate,
                                {
                                  id: socketRef.current.id,
                                  videoFlag,
                                  audioFlag: true,
                                },
                              ]);
                              track.enabled = true;
                              setAudioFlag(true);
                            }
                          }
                        });
                    }
                  }}
                />
                <div className="name">{username}</div>
              </div>
            )}
          </div>

          {peers.map((peer) => {
            let audioFlagTemp = true;
            let videoFlagTemp = true;
            if (userUpdate) {
              userUpdate.forEach((entry) => {
                if (peer && peer.peerID && peer.peerID === entry.id) {
                  audioFlagTemp = entry.audioFlag;
                  videoFlagTemp = entry.videoFlag;
                }
              });
            }
            return (
              <div className="VideoContainer2">
                <Video peer={peer.peer} key={peer.peerID} />
                <div className="ControlSmall">
                  <img
                    className="ImgComponentSmall"
                    src={videoFlagTemp ? webcam : webcamoff}
                  />
                  &nbsp;&nbsp;&nbsp;
                  <img
                    className="ImgComponentSmall"
                    src={audioFlagTemp ? micunmute : micmute}
                  />
                </div>
              </div>
            );
          })}
        </div>
        {showChat && <Chat />}
      </div>
      <div className="footer-item">
        <div className="left-item">
          <div className="text">
            <iframe
              src="https://free.timeanddate.com/clock/i8wb6p4g/n1884/tlin/fs16/avb/ftb/th2/ts1"
              frameborder="0"
              width="71"
              height="20"
            ></iframe>
            | Meet id: {roomID}
          </div>
        </div>
        <div className="center-item" style={{ marginRight: "20px" }}>
          <FontAwesomeIcon
            className="ficons"
            icon={videoFlag ? faVideo : faVideoSlash}
            onClick={() => {
              if (userVideo.current.srcObject) {
                userVideo.current.srcObject
                  .getTracks()
                  .forEach(function (track) {
                    if (track.kind === "video") {
                      if (track.enabled) {
                        socketRef.current.emit("change", [
                          ...userUpdate,
                          {
                            id: socketRef.current.id,
                            videoFlag: false,
                            audioFlag,
                          },
                        ]);
                        track.enabled = false;
                        setVideoFlag(false);
                      } else {
                        socketRef.current.emit("change", [
                          ...userUpdate,
                          {
                            id: socketRef.current.id,
                            videoFlag: true,
                            audioFlag,
                          },
                        ]);
                        track.enabled = true;
                        setVideoFlag(true);
                      }
                    }
                  });
              }
            }}
          />

          <FontAwesomeIcon
            className="ficons"
            icon={audioFlag ? faMicrophone : faMicrophoneSlash}
            onClick={() => {
              if (userVideo.current.srcObject) {
                userVideo.current.srcObject
                  .getTracks()
                  .forEach(function (track) {
                    if (track.kind === "audio") {
                      if (track.enabled) {
                        socketRef.current.emit("change", [
                          ...userUpdate,
                          {
                            id: socketRef.current.id,
                            videoFlag,
                            audioFlag: false,
                          },
                        ]);
                        track.enabled = false;
                        setAudioFlag(false);
                      } else {
                        socketRef.current.emit("change", [
                          ...userUpdate,
                          {
                            id: socketRef.current.id,
                            videoFlag,
                            audioFlag: true,
                          },
                        ]);
                        track.enabled = true;
                        setAudioFlag(true);
                      }
                    }
                  });
              }
            }}
          />
          <FontAwesomeIcon
            className="ficons"
            icon={faRecordVinyl}
            onClick={RecordMeeting}
          />
          <FontAwesomeIcon
            className="ficons"
            icon={faPause}
            onClick={StopRecordMeeting}
          />
          <FontAwesomeIcon
            className="ficons"
            icon={faPhone}
            size="2xl"
            beat
            onClick={() => {
              peers.map((peer) => {
                peer.peer.destroy();
              });
              navigate("/");
            }}
          />
        </div>
        <div className="right-item">
          <FontAwesomeIcon className="icons" icon={faCircleInfo} />
          <FontAwesomeIcon className="icons" icon={faUsers} />
          <FontAwesomeIcon
            className="icons"
            icon={faMessage}
            onClick={() => {
              setshowChat(!showChat);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Room;
