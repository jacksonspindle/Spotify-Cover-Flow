import axios from "axios";
import React, { useEffect } from "react";

const SpotifyAuth = ({
  accessToken,
  setAccessToken, // Renamed to handleAuthComplete
  onAuthStart, // New prop for handling the start of authentication
}) => {
  const clientID = "151677323bd146f8b3590d8c58c36673";
  const redirectURI = "http://localhost:3000/callback";

  const authorizeURL = `https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=code&redirect_uri=${encodeURIComponent(
    redirectURI
  )}&scope=user-library-read user-library-modify`;

  const requestAccessToken = async (code) => {
    try {
      const response = await axios.post(
        "https://accounts.spotify.com/api/token",
        null,
        {
          params: {
            grant_type: "authorization_code",
            code: code,
            redirect_uri: redirectURI,
            client_id: clientID,
            client_secret: "b3a964753ddc407189c567f7c9d141af",
          },
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      setAccessToken(response.data.access_token); // Call handleAuthComplete
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code) {
      onAuthStart(); // Call onAuthStart when the authentication process begins
      requestAccessToken(code);
    }
  }, []);

  // Function to handle logout
  const handleLogout = () => {
    setAccessToken(null); // Call handleAuthComplete
  };

  return (
    <div className={"spotify-login"}>
      <div className={"spotify-login-container"}>
        {!accessToken ? (
          <a href={authorizeURL}>Login with Spotify</a>
        ) : (
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </div>
  );
};

export default SpotifyAuth;
