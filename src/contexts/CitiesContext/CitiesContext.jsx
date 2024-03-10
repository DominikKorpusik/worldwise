import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
const BASE_URL = "http://localhost:3001";

const cities = [
  {
    cityName: "Lisbon",
    country: "Portugal",
    emoji: "🇵🇹",
    date: "2027-10-31T15:59:59.138Z",
    notes: "My favorite city so far!",
    position: { lat: 38.727881642324164, lng: -9.140900099907554 },
    id: "2dbc",
  },
  {
    cityName: "Madrid",
    country: "Spain",
    emoji: "🇪🇸",
    date: "2027-07-15T08:22:53.976Z",
    notes: "",
    position: { lat: 40.46635901755316, lng: -3.7133789062500004 },
    id: "2ccc",
  },
  {
    cityName: "Warsaw",
    country: "Poland",
    emoji: "🇵🇱",
    date: "2024-03-04T16:04:53.204Z",
    notes: "",
    position: { lat: 52.22443459871999, lng: 20.9893798828125 },
    id: "8448",
  },
];

const CitiesContext = createContext();

const initialState = {
  cities: cities,
  currentCity: {},
  isLoading: true,
  error: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "loading":
      return {
        ...state,
        isLoading: true,
      };
    case "cities/loaded":
      return {
        ...state,
        isLoading: false,
        cities: action.payload,
      };
    case "city/loaded":
      return { ...state, isLoading: false, currentCity: action.payload };
    case "city/created":
      return {
        ...state,
        isLoading: false,
        cities: [...state.cities, action.payload],
        currentCity: action.payload,
      };
    case "city/deleted":
      return {
        ...state,
        isLoading: false,
        cities: state.cities.filter((city) => city.id !== action.payload),
        currentCity: {},
      };
    case "rejected":
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    default:
      throw new Error("Invalid action type");
  }
}

function CitiesProvider({ children }) {
  const [{ cities, currentCity, isLoading, error }, dispatch] = useReducer(
    reducer,
    initialState
  );

  useEffect(function () {
    async function fetchCities() {
      dispatch({ type: "loading" });
      try {
        const res = await fetch(`${BASE_URL}/cities`);
        const data = await res.json();
        dispatch({ type: "cities/loaded", payload: data });
      } catch (error) {
        dispatch({
          type: "rejected",
          payload: "There was an error loading the cities...",
        });
      }
    }

    fetchCities();
  }, []);

  const getCity = useCallback(
    async function getCity(id) {
      if (id === currentCity.id) return;

      dispatch({ type: "loading" });
      try {
        const res = await fetch(`${BASE_URL}/cities/${id}`);
        const data = await res.json();
        dispatch({ type: "city/loaded", payload: data });
      } catch (error) {
        dispatch({
          type: "rejected",
          payload: "There was an error loading the city...",
        });
      }
    },
    [currentCity.id]
  );

  async function createCity(newCity) {
    dispatch({ type: "loading" });
    try {
      const res = await fetch(`${BASE_URL}/cities`, {
        method: "POST",
        body: JSON.stringify(newCity),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      dispatch({ type: "city/created", payload: data });
    } catch (error) {
      dispatch({
        type: "rejected",
        payload: "There was an error creating the city..." + error,
      });
    }
  }

  async function deleteCity(id) {
    dispatch({ type: "loading" });
    try {
      await fetch(`${BASE_URL}/cities/${id}`, {
        method: "DELETE",
      });
      dispatch({ type: "city/deleted", payload: id });
    } catch (error) {
      dispatch({
        type: "rejected",
        payload: "There was an error deleting the city..." + error,
      });
    }
  }

  return (
    <CitiesContext.Provider
      value={{
        cities,
        isLoading,
        currentCity,
        getCity,
        createCity,
        deleteCity,
        error,
      }}
    >
      {children}
    </CitiesContext.Provider>
  );
}

function useCities() {
  const value = useContext(CitiesContext);
  if (value === undefined)
    throw new Error("useCities must be used within a CitiesProvider");
  return value;
}

export { useCities, CitiesProvider };
