import React, { useState, useEffect } from "react";
import { useTexture, Html } from "@react-three/drei";
import { useSpring, animated as a } from "@react-spring/three";
// import AlbumInfo from "./AlbumInfo";
import axios from "axios";
// import Loader, { ThreeDots } from "react-loader-spinner";

function AlbumCover({
  textureUrl,
  position,
  rotation,
  onClick,
  isSelected,
  isEnlarged,
  renderOrder,
  scale,
  trackList,
  albumTitle,
  artistName,
  artistDescription,
  artistImage,
  albumDescription,
}) {
  const [showHtml, setShowHtml] = useState(false);
  const texture = useTexture(textureUrl);
  const [musicVideos, setMusicVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const spring = useSpring({
    position: position,
    scale: isEnlarged ? [1.3, 1.3, 1.3] : [1, 1, 1],
    rotation: isEnlarged ? [0, Math.PI, 0] : rotation,
    config: { mass: 1, tension: 80, friction: 25 },
  });

  const frontMaterial = { map: texture, color: "white" };

  useEffect(() => {
    let timer;
    if (isEnlarged) {
      timer = setTimeout(() => setShowHtml(true), 200); // 100ms delay
    } else {
      setShowHtml(false);
    }
    return () => clearTimeout(timer); // Clear timeout on unmount
  }, [isEnlarged]);

  // Function to fetch music videos from YouTube
  const fetchMusicVideos = async () => {
    setIsLoading(true);
    try {
      // Define the YouTube Data API key
      const apiKey = "AIzaSyD_Wk6lhxQ3NODDsugh8r8S3f5SQgXIcW8";

      const videoUrls = [];
      for (const track of trackList) {
        const query = `${artistName} ${track.name} official music video`;
        const response = await axios.get(
          "https://www.googleapis.com/youtube/v3/search",
          {
            params: {
              part: "snippet",
              q: query,
              type: "video",
              maxResults: 49,
              key: apiKey,
            },
          }
        );
        // Convert the query to lowercase and split into words
        const queryWords = query.toLowerCase().split(" ");

        // Filter videos based on the video title
        const filteredVideos = response.data.items.filter((item) => {
          const videoTitle = item.snippet.title.toLowerCase();
          // Check if all words in the query are included in the video title
          return queryWords.every((word) => videoTitle.includes(word));
        });

        // Add filtered videos to videoUrls array
        filteredVideos.forEach((video) => {
          const videoId = video.id.videoId;
          videoUrls.push(`https://www.youtube.com/embed/${videoId}`);
        });
      }
      setMusicVideos(videoUrls);
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isEnlarged) {
      // Fetch music videos when the album is selected
      fetchMusicVideos();
    } else {
      setMusicVideos([]); // Reset music videos when album is deselected
    }
  }, [isEnlarged, fetchMusicVideos]);

  return (
    <>
      <a.group
        position={spring.position}
        rotation={spring.rotation}
        scale={spring.scale}
        onClick={onClick}
        renderOrder={renderOrder}
      >
        {/* Front mesh */}
        <mesh position={[0, 0, 0.05]}>
          <boxBufferGeometry args={[3, 3, 0.1]} />
          <meshBasicMaterial {...frontMaterial} />
        </mesh>
        {/* Back mesh (rendered only if album is selected) */}
        {isSelected && (
          <mesh position={[0, 0, -0.05]} rotation={[0, Math.PI, 0]}>
            <boxBufferGeometry args={[3, 3, 0.1]} />
            <meshBasicMaterial color="black" />
            {showHtml && (
              <Html
                center
                transform
                distanceFactor={2} // Adjust to control scaling relative to camera distance
                style={{ width: "593px", height: "593px" }}
                className="html-3d"
              >
                <div
                  className="html-div"
                  style={{
                    background: "black",
                    fontSize: "24px", // Adjust font size for clarity
                    color: "white",
                    width: "100%", // Set width to match Html container
                    height: "100%", // Set height to match Html container
                    overflow: "auto",
                  }}
                >
                  {/* <AlbumInfo /> */}
                  <h1>{albumTitle}</h1>
                  <p>{artistName}</p>
                  <br></br>
                  <p>{albumDescription}</p>
                  <img src={artistImage} alt="1"></img>
                  {trackList.map((track, index) => (
                    <p key={index}>{`${index + 1}. ${track.name}`}</p>
                  ))}
                  {/* Add images or videos here */}

                  <br></br>
                  <br></br>
                  <br></br>
                  <br></br>
                  <br></br>
                  <br></br>

                  {isLoading ? (
                    // Render the loader while data is being fetched
                    <ThreeDots />
                  ) : (
                    // Render iframes when data fetching is complete
                    musicVideos.map((url, index) => (
                      <iframe
                        key={index}
                        width="560"
                        height="315"
                        src={url}
                        frameBorder="0"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                        title={`video-${index}`}
                      ></iframe>
                    ))
                  )}
                </div>
              </Html>
            )}
          </mesh>
        )}
      </a.group>
    </>
  );
}

export default AlbumCover;
