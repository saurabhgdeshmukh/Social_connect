import React from "react";
import { useNavigate } from "react-router-dom";
import "./InfoPage.css";

const InfoPage = () => {
  const navigate = useNavigate();
  const developers = [
    {
      name: "Abhay Naidu",
      Github: "https://github.com/naiduabhay9731",
      LinkedIn: "https://www.linkedin.com/in/abhay-naidu-640053227/",
      contact: "8758556827",
    },
    {
      name: "Om Choudhary",
      Github: "https://github.com/ssobehtmo26",
      LinkedIn: "https://www.linkedin.com/in/om-choudhary-713a31226/",
      contact: "8179386193",
    },
    {
      name: "Soumyadip Mondal",
      Github: "https://github.com/Soumya-002",
      LinkedIn: "https://www.linkedin.com/in/soumyadip-mondal-050570247/",
      contact: "9749864563",
    },
  ];

  return (
    <div className="info-page">
      <h1>Developers</h1>
      {developers.map((developer, index) => (
        <div key={index} className="developer-card">
          <h2>{developer.name}</h2>
          <p>
            <strong>Github: </strong>{" "}
            <a href={developer.Github}>{developer.Github}</a>
          </p>
          <p>
            <strong>LinkedIn: </strong>{" "}
            <a href={developer.LinkedIn}>{developer.LinkedIn}</a>
          </p>
          <p>
            <strong>Contact: </strong>
            {developer.contact}
          </p>
        </div>
      ))}
      <button
        onClick={() => {
          navigate("/");
        }}
        className="button"
      >
        Back
      </button>
    </div>
  );
};

export default InfoPage;
