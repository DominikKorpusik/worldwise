// "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=0&longitude=0"

import { useEffect, useState } from "react";
import { useURLPosition } from "../../hooks/useURLPosition/useURLPosition";
import { useCities } from "../../contexts/CitiesContext/CitiesContext";
import { useNavigate } from "react-router-dom";

import styles from "./Form.module.css";
import Button from "../Button/Button";
import BackButton from "../BackButton/BackButton";
import Message from "../Message/Message";
import Spinner from "../Spinner/Spinner";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { map } from "leaflet";

export function convertToEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

const BASE_ULR = "https://api.bigdatacloud.net/data/reverse-geocode-client";

function Form() {
  const [isLoadingGeocoding, setIsLoadingGeocoding] = useState(false);
  const [cityName, setCityName] = useState("");
  const [country, setCountry] = useState("");
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [mapLat, mapLng] = useURLPosition();
  const [emoji, setEmoji] = useState("");
  const [geocodingError, setGeocodingError] = useState(null);
  const { createCity, isLoading } = useCities();
  const navigate = useNavigate();

  useEffect(() => {
    if (!mapLat || !mapLng) return;

    async function fetchCityData() {
      try {
        if (mapLat && mapLng) {
          setIsLoadingGeocoding(true);
          setGeocodingError(null);
          const response = await fetch(
            BASE_ULR + "?latitude=" + mapLat + "&longitude=" + mapLng
          );
          const data = await response.json();

          if (!data.countryCode)
            throw new Error(
              "That doesn't look like a valid location. Please try again."
            );

          setCityName(data.city || data.locality || "");
          setCountry(data.countryName);
          setEmoji(convertToEmoji(data.countryCode));
        }
      } catch (error) {
        setGeocodingError(error.message);
      } finally {
        setIsLoadingGeocoding(false);
      }
    }

    fetchCityData();
  }, [mapLat, mapLng]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!cityName || !date) return;
    const city = {
      cityName,
      country,
      date,
      notes,
      emoji,
      position: { lat: mapLat, lng: mapLng },
    };

    await createCity(city);
    navigate("/app/cities");
  }

  if (isLoadingGeocoding) return <Spinner />;
  if (!mapLat || !mapLng)
    return (
      <Message message="We couldn't find your location. Try to click again." />
    );
  if (geocodingError) return <Message message={geocodingError} />;

  return (
    <form
      className={`${styles.form} ${isLoading ? styles.loading : ""}`}
      onSubmit={(e) => handleSubmit(e)}
    >
      <div className={styles.row}>
        <label htmlFor="cityName">City name</label>
        <input
          id="cityName"
          onChange={(e) => setCityName(e.target.value)}
          value={cityName}
        />
        <span className={styles.flag}>{emoji}</span>
      </div>

      <div className={styles.row}>
        <label htmlFor="date">When did you go to {cityName}?</label>
        <DatePicker
          id="date"
          onChange={(date) => setDate(date)}
          selected={date}
          dateFormat="dd/MM/yyyy"
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="notes">Notes about your trip to {cityName}</label>
        <textarea
          id="notes"
          onChange={(e) => setNotes(e.target.value)}
          value={notes}
        />
      </div>

      <div className={styles.buttons}>
        <Button type="primary">Add</Button>
        <BackButton />
      </div>
    </form>
  );
}

export default Form;
