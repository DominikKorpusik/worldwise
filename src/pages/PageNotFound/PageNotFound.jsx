import { Link } from "react-router-dom";

export default function PageNotFound() {
  return (
    <div>
      <h1>
        Page not found 😢
        <Link to="/">Go back to the homepage</Link>
      </h1>
    </div>
  );
}
