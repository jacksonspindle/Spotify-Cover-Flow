import React from "react";

const AlbumInfo = ({ album, onDeselect }) => {
  if (!album) return null; // If no album data, render nothing

  return (
    <div className="album-info-popup-container" onClick={onDeselect}>
      <div className="album-info-popup">
        <h3>{album.name}</h3> {/* Album name */}
        <p>{album.artists[0].name}</p> {/* Artist name */}
      </div>
    </div>
  );
};

export default AlbumInfo;
