import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../assets/Header";
import { useState, useEffect, createContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import { faKeyboard, faVideo } from "@fortawesome/free-solid-svg-icons";
import "./CreateRoom.css";

export const DataContext = createContext();
const CreateRoom = (props) => {
  const [email, setEmail] = useState("");
  const [generatedToken, setGeneratedToken] = useState();
  const [enteredToken, setEnteredToken] = useState();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);

  const [profile, setProfile] = useState(null);

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => {
      setUser(codeResponse);

      console.log(codeResponse);
    },
    onError: (error) => console.log("Login Failed:", error),
  });

  useEffect(() => {
    const loggedusername = localStorage.getItem("username");
    const loggeduseremail = localStorage.getItem("useremail");
    const loggeduserpic=localStorage.getItem("userpic");
    
    if (loggedusername) {
      var loggeduser={
        name:loggedusername,
        email:loggeduseremail,
        picture:loggeduserpic
      }
      setProfile(loggeduser);
      
    } else {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    if (user != null) {
      axios
        .get(
          `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`,
          {
            headers: {
              Authorization: `Bearer ${user.access_token}`,
              Accept: "application/json",
            },
          }
        )
        .then((res) => {
          setProfile(res.data);
          
          
          localStorage.setItem("user",JSON.stringify({
            name:res.data.name
          }))

          localStorage.setItem("username", res.data.name );
          localStorage.setItem("useremail", res.data.email );
          localStorage.setItem("userpic", res.data.picture );

        })
        .catch((err) => console.log(err));
    }
  }, [user]);

  const logOut = () => {
    googleLogout();
    setProfile(null);
    localStorage.clear();
  };

  const generateToken = () => {
    var rand = Math.random().toString(36).substring(2);
    setGeneratedToken(rand);
    console.log(profile);
    console.log(profile.name);
    //setEmail(profile.name);
    return;
  };

  const tokenHandler = (e) => {
    setEmail(profile.name);
    setEnteredToken(e.target.value);
  };

  const joinMeet = () => {
  

    localStorage.setItem("email", JSON.stringify(email));
    navigate(`/room?roomID=${enteredToken}`);
  };

  return (
    <div className="home-page">
      <DataContext.Provider value={profile ? profile : null}>
        <Header />
      </DataContext.Provider>

      <div className="body-content">
        <div className="left-side">
          <h2>Premium video meetings.</h2>
          <h2>Now free for everyone</h2>
          <p>
            We re-engineered the service we built for secure business
            meetings,Google Meet,to make it free and available for all
          </p>

          {profile != null ? (
            <div>
              <div className="action-btn">
                <div className="video-btn">
                  <button type="button" className="btn" onClick={generateToken}>
                    <FontAwesomeIcon className="icons col" icon={faVideo} />
                    New Meeting
                  </button>
                </div>

                <div className="input-block">
                  <div className="input-section">
                    <FontAwesomeIcon className="icon-block" icon={faKeyboard} />
                    <input
                      type="text"
                      className="input"
                      placeholder="Enter Token"
                      value={enteredToken}
                      onChange={tokenHandler}
                    />
                  </div>
                  <button className="bttn" onClick={joinMeet}>
                    Join
                  </button>
                </div>
              </div>
              <div>{generatedToken}</div>
              <button className="bttn" onClick={logOut}>
                Log out
              </button>
            </div>
          ) : (
            <div className="action-btn">
              <button onClick={() => login()} className="btn">
                Sign in with Google{" "}
              </button>
            </div>
          )}
          {/* <input
            type="text"
            className="input"
            placeholder="Enter email"
            onChange={emailHandler}
          ></input> */}

          <hr />
          <div className="help-text">
            <a
              onClick={() => {
                navigate("/info");
              }}
            >
              Learn more
            </a>{" "}
            about Us
          </div>
        </div>
        <div className="right-side">
          <div className="content">
            <img
              src="https://cdn.vox-cdn.com/thumbor/PvYHf9f7nUddjyJIl7l84BRAIW8=/0x0:1980x1320/1400x1050/filters:focal(990x660:991x661)/cdn.vox-cdn.com/uploads/chorus_asset/file/22459255/googlemeetnewui.jpg"
              alt="not found"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRoom;
