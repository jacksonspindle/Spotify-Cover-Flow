import React, { useState, useEffect } from "react";
import axios from "axios";

const SpotifySearch = ({ accessToken, onAddAlbum }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearch = async () => {
    if (!accessToken || !searchTerm) return;
    try {
      const response = await axios.get("https://api.spotify.com/v1/search", {
        params: {
          q: searchTerm,
          type: "album",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setSearchResults(response.data.albums.items);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddToLibrary = async (albumId) => {
    if (!accessToken || !albumId) return;
    try {
      // Find the album data from searchResults based on albumId
      const newAlbum = searchResults.find((album) => album.id === albumId);
      if (!newAlbum) return; // If the album is not found, return early

      // Make the API call to add the album to the library
      await axios.put(
        `https://api.spotify.com/v1/me/albums?ids=${albumId}`,
        null,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Call the onAddAlbum function with the new album data
      onAddAlbum(newAlbum);

      alert("Album added to your library!");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ position: "absolute", zIndex: "2" }}>
      <input
        className="spotify-search-input"
        type="text"
        placeholder="Search Spotify..."
        value={searchTerm}
        onChange={handleSearchChange}
      />
      <button className="spotify-search-button" onClick={handleSearch}>
        Search
      </button>
      <div>
        {searchResults.map((album) => (
          <div key={album.id}>
            <img src={album.images[0]?.url} alt={album.name} width="100" />
            <div>{album.name}</div>
            <button onClick={() => handleAddToLibrary(album.id)}>
              Add to Library
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpotifySearch;
