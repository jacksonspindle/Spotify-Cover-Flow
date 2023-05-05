import React, { useState, useEffect, useRef, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
// import albumsData from "./albums.json";
import AlbumCover from "./AlbumCover";
// import { OrbitControls } from "@react-three/drei";
// import AlbumInfo from "./AlbumInfo";
// import { useThree } from "@react-three/fiber";
// import * as THREE from "three";

function CoverFlow({ albumsData, searchQuery, coverFlowContainerRef }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const scrollAccumulator = useRef(0); // Accumulated deltaY value from scroll events
  const scrollThreshold = 100; // Scroll sensitivity threshold
  const canvasRef = useRef(null);
  const [grow, setGrow] = useState(false);
  const selectedAlbum = albumsData?.[selectedIndex]?.album;
  const albumInfoRef = useRef();

  useEffect(() => {
    console.log(albumsData);
  });

  //   useEffect(() => {
  //     // Logic to handle updates and re-render of the CoverFlow component
  //     // For example, you can call a function to update the layout or re-render album covers
  //   }, [searchQuery]);

  //   const { scene } = useThree();
  //   console.log(albumsData);

  const handleWheel = (event) => {
    // Prevent default scroll behavior on the entire page
    event.preventDefault();

    const delta = event.deltaY;

    // Accumulate deltaY from scroll events
    scrollAccumulator.current += delta;

    // Determine the number of steps based on the threshold
    const steps = Math.floor(
      Math.abs(scrollAccumulator.current) / scrollThreshold
    );

    // If the accumulated deltaY exceeds the threshold, update the selectedIndex
    if (steps > 0) {
      const direction = Math.sign(scrollAccumulator.current);
      const newIndex = selectedIndex + direction * steps;
      setSelectedIndex(Math.max(Math.min(newIndex, albumsData.length - 1), 0));

      // Subtract the used deltaY from the accumulator
      scrollAccumulator.current -= direction * steps * scrollThreshold;
    }
  };

  useEffect(() => {
    const canvasElement = canvasRef.current;
    if (canvasElement) {
      // Attach wheel event listener directly to the Canvas DOM element with passive: false
      canvasElement.addEventListener("wheel", handleWheel, { passive: false });
      return () => {
        // Remove wheel event listener when the component is unmounted
        canvasElement.removeEventListener("wheel", handleWheel);
      };
    }
  }, [handleWheel]);

  const [enlargedIndex, setEnlargedIndex] = useState(null); // New state for enlargedIndex

  const handleAlbumClick = (index) => {
    console.log(albumsData);
    if (index === selectedIndex) {
      // If the clicked album is already selected, toggle the enlargement
      if (enlargedIndex === index) {
        // If the album is already enlarged, reset enlargement
        setEnlargedIndex(null);
        setGrow(false); // Reset grow state
      } else {
        // If the album is not enlarged, set enlargement
        setEnlargedIndex(index);
        setGrow(true); // Set grow state to true
      }
    } else {
      // If another album is clicked, select it and reset the enlargement
      setSelectedIndex(index);
      setEnlargedIndex(null);
      setGrow(false); // Reset grow state
    }
  };

  //   const handleDeselect = () => {
  //     setGrow(false);
  //     setEnlargedIndex(!enlargedIndex);
  //   };

  useEffect(() => {
    const handleClickOutside = (event) => {
      //   if (
      //     grow &&
      //     albumInfoRef.current &&
      //     !albumInfoRef.current.contains(event.target)
      //   ) {
      //     handleDeselect();
      //   }
      //   handleDeselect();
      //   console.log(!albumInfoRef.current.contains(event.target));
    };

    // Add the event listener when the component mounts
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Remove the event listener when the component unmounts
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [grow, albumInfoRef]);

  return (
    <div className="canvas">
      <Canvas ref={canvasRef}>
        {/* <OrbitControls /> */}
        <Suspense fallback={null}>
          {albumsData &&
            albumsData.map((item, index) => {
              const album = item.album;
              const artworkUrl = album.images[0]?.url;
              const offset = index - selectedIndex;
              const trackList = album.tracks.items;

              const rotation = [0, (-Math.sign(offset) * Math.PI) / 4, 0]; // Calculate rotation based on offset

              const isSelected = index === selectedIndex; // Check if this album is selected
              const isEnlarged = index === enlargedIndex; // Check if this album is enlarged
              const scale = isEnlarged ? [1.3, 1.3, 1.3] : [1, 1, 1];
              const zOffset = isSelected ? 0.5 : isEnlarged ? -2 : 0; // Calculate z-offset for the enlarged album
              const position = [offset * 2.9, 0, zOffset];

              return (
                <AlbumCover
                  key={album.id}
                  textureUrl={artworkUrl}
                  position={position}
                  rotation={rotation} // Pass rotation to AlbumCover
                  onClick={() => handleAlbumClick(index)}
                  isSelected={isSelected}
                  isEnlarged={isEnlarged}
                  renderOrder={isEnlarged ? 1 : 0}
                  scale={scale}
                  trackList={trackList}
                  albumTitle={album.name}
                  artistName={album.artists[0].name}
                  artistDescription={item.artistDescription}
                  artistImage={item.artistImage}
                  genre={item.genre}
                  albumDescription={item.albumDescription}
                />
              );
            })}
        </Suspense>
      </Canvas>
      {/* {grow && selectedAlbum && (
        <div ref={albumInfoRef}>
          <AlbumInfo album={selectedAlbum} />
        </div>
      )} */}
      {selectedAlbum && (
        <div className="album-info">
          <h3>{selectedAlbum.name}</h3> {/* Album name */}
          <p>{selectedAlbum.artists[0].name}</p> {/* Artist name */}
        </div>
      )}
    </div>
  );
}

export default CoverFlow;
