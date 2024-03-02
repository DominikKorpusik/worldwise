/* eslint-disable no-unused-vars */
import { useSearchParams } from "react-router-dom";
import PropTypes from "prop-types";

import styles from "./Map.module.css";

function Map() {
  const [searchParams, setSearchParams] = useSearchParams();
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  return (
    <div className={styles.mapContainer} onClick={() => {}}>
      <h1>Map</h1>
      <p>Latitude: {lat}</p>
      <p>Longitude: {lng}</p>
      <button
        onClick={() => setSearchParams({ lat: "40.7128", lng: "-74.0060" })}
      >
        New York
      </button>
    </div>
  );
}

export default Map;
