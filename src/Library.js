import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import CoverFlow from "./CoverFlow";
import SpotifySearch from "./SpotifySearch";

const Library = ({ accessToken, canvasRef, onLibraryLoadComplete }) => {
  const [albums, setAlbums] = useState([]);
  const [sortType, setSortType] = useState("default");
  const [searchQuery, setSearchQuery] = useState("");
  const coverFlowContainerRef = useRef(null);
  const [inputValue, setInputValue] = useState("");
  const [displayedAlbums, setDisplayedAlbums] = useState([]);

  useEffect(() => {
    coverFlowContainerRef.current?.scrollTo(0, 0);
  }, [searchQuery]);

  const onAddAlbum = async (newAlbum) => {
    await fetchLibrary();
  };

  const handleDataFetched = () => {
    if (onLibraryLoadComplete) {
      onLibraryLoadComplete();
    }
  };

  const cleanAlbumName = (albumName) => {
    const substringsToRemove = [
      "(Deluxe Version)",
      "(Deluxe Edition)",
      "(DELUXE)",
      "(Deluxe)",
      "(Complete)",
      "(25th Anniversary Edition)",
      "(45th Anniversary Edition)",
      "(45th Anniversary )",
      "(25th Anniversary)",
      "(Expanded Version)",
      "(Collector's Edition)",
      "(Remastered)",
      "(Remastered Version)",
    ];
    substringsToRemove.forEach((substring) => {
      albumName = albumName.replace(substring, "").trim();
    });
    return albumName;
  };

  const fetchLibrary = async () => {
    if (!accessToken) return;
    try {
      const limit = 50; // Maximum number of items per request
      let offset = 0; // Index of the first item to return
      let hasNextPage = true;
      let allAlbums = [];

      while (hasNextPage) {
        const response = await axios.get(
          "https://api.spotify.com/v1/me/albums",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            params: {
              limit: limit,
              offset: offset,
            },
          }
        );

        const albumsWithDescriptions = await Promise.all(
          response.data.items.map(async (item) => {
            const artistId = item.album.artists[0].id;
            const artistName = item.album.artists[0].name;

            // let albumName = item.album.name;

            // const substringsToRemove = ["(Deluxe Version)", "(Deluxe Edition)"];

            // substringsToRemove.forEach((substring) => {
            //   albumName = albumName.replace(substring, "").trim();
            //   console.log("albumName:", albumName);
            // });

            const albumTitle = cleanAlbumName(item.album.name);
            console.log("albumTitle:", albumTitle);

            // Fetch artist information from Spotify API
            const artistResponse = await axios.get(
              `https://api.spotify.com/v1/artists/${artistId}`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            );

            const audioDbArtist = {
              method: "GET",
              url: "https://theaudiodb.p.rapidapi.com/search.php",
              params: { s: artistName },
              headers: {
                "X-RapidAPI-Key":
                  "f4b38ba64emshb5a977cb8219b10p131aaejsnefaf0af018f4",
                "X-RapidAPI-Host": "theaudiodb.p.rapidapi.com",
              },
            };
            const audioDBAlbum = {
              method: "GET",
              url: "https://theaudiodb.p.rapidapi.com/searchalbum.php",
              params: { s: artistName },
              headers: {
                "X-RapidAPI-Key":
                  "f4b38ba64emshb5a977cb8219b10p131aaejsnefaf0af018f4",
                "X-RapidAPI-Host": "theaudiodb.p.rapidapi.com",
              },
            };

            const theAudioDbArtistResponse = await axios.request(audioDbArtist);
            const theAudioDbAlbumResponse = await axios.request(audioDBAlbum);

            const genre = artistResponse.data.genres[0] || "Unknown";

            const foundAlbum =
              theAudioDbAlbumResponse.data.album &&
              theAudioDbAlbumResponse.data.album.find(
                (album) =>
                  album.strAlbum.toLowerCase() === albumTitle.toLowerCase()
              );
            const albumDescription = foundAlbum?.strDescriptionEN || "";

            return { ...item, genre, albumDescription }; // Associate genre and album description with the album
          })
        );

        // Concatenate the albums from the current response
        allAlbums = allAlbums.concat(albumsWithDescriptions);

        // Check if there are more items to fetch
        hasNextPage = response.data.next !== null;

        // Update the offset for the next request
        offset += limit;
      }

      // Set the state with all retrieved albums
      setAlbums(allAlbums);
      handleDataFetched();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, [accessToken]);

  const handleSort = (type) => {
    setSortType(type);
    if (type === "artist") {
      setAlbums(
        albums.sort((a, b) =>
          a.album.artists[0].name.localeCompare(b.album.artists[0].name)
        )
      );
    } else if (type === "album") {
      setAlbums(
        albums.sort((a, b) => a.album.name.localeCompare(b.album.name))
      );
    } else if (type === "genre") {
      setAlbums(albums.sort((a, b) => a.genre.localeCompare(b.genre)));
    } else {
      fetchLibrary();
    }
  };

  // const handleSearchChange = (event) => {
  //   setSearchQuery(event.target.value);
  // };

  const filteredAlbums = albums.filter((item) => {
    let album = item.album.name;
    const substringsToRemove = ["(Deluxe Version)", "(Deluxe Edition)"];

    substringsToRemove.forEach((substring) => {
      album = album.replace(substring, "").trim();
      console.log("album:", album);
    });

    // const albumTitle = albumName;

    const albumName = cleanAlbumName(item.album.name).toLowerCase();
    const artistName = item.album.artists[0].name.toLowerCase();
    const query = searchQuery.toLowerCase();
    return albumName.includes(query) || artistName.includes(query);
  });

  const debounce = (func, delay) => {
    let debounceTimer;
    return function (...args) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(this, args), delay);
    };
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const debouncedHandleSearchChange = debounce((value) => {
    setSearchQuery(value);
  }, 300);

  useEffect(() => {
    debouncedHandleSearchChange(inputValue);
  }, [inputValue]);

  return (
    <div ref={coverFlowContainerRef}>
      {accessToken && (
        <SpotifySearch onAddAlbum={onAddAlbum} accessToken={accessToken} />
      )}
      <div className="sort-options">
        <button className="button-small" onClick={() => handleSort("default")}>
          Default
        </button>
        <button className="button-small" onClick={() => handleSort("artist")}>
          Sort by Artist
        </button>
        <button className="button-small" onClick={() => handleSort("album")}>
          Sort by Album
        </button>
        <button className="button-small" onClick={() => handleSort("genre")}>
          Sort by Genre
        </button>
      </div>

      <input
        className="search-input"
        type="text"
        placeholder="Search by artist or album..."
        value={inputValue}
        onChange={handleInputChange}
      />

      {filteredAlbums.length > 0 ? (
        <CoverFlow albumsData={filteredAlbums} />
      ) : (
        <div>No albums found for the search query.</div>
      )}
    </div>
  );
};

export default Library;
