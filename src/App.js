import React, { useState } from "react";
import "./App.css";
import CoverFlow from "./CoverFlow";
import SpotifyAuth from "./SpotifyAuth";
import SpotifySearch from "./SpotifySearch";
import Library from "./Library"; // Import the Library component
import { ThreeDots } from "react-loader-spinner";

function App() {
  const [accessToken, setAccessToken] = useState(null);
  const [showLibrary, setShowLibrary] = useState(false); // State to toggle library view
  const [isLoading, setIsLoading] = useState(false);

  const handleViewLibrary = () => {
    setShowLibrary(true);
  };

  // console.log(accessToken);

  const handleAuthStart = () => {
    setIsLoading(true);
  };

  const handleAuthComplete = (token) => {
    setAccessToken(token);
    setIsLoading(false);
  };

  const handleLibraryLoadComplete = () => {
    setIsLoading(false); // Hide loading animation when library is loaded
  };

  return (
    <div className="App">
      {/* <CoverFlow /> */}
      <div className="spotify-login">
        <SpotifyAuth
          accessToken={accessToken}
          setAccessToken={handleAuthComplete}
          onAuthStart={handleAuthStart} // Pass the handleAuthStart function to the SpotifyAuth component
        />

        {accessToken && (
          <Library
            onLibraryLoadComplete={handleLibraryLoadComplete}
            accessToken={accessToken}
          />
        )}
      </div>
      {isLoading && <ThreeDots />}
    </div>
  );
}

export default App;
