import { Link } from "react-router-dom";
import "./header.css";

export default function Header() {
  return (
    <header>
      <Link className="logo" to="/">
        Logo
      </Link>
      <Link className="create-link" to="/new">
        Create Article
      </Link>
    </header>
  );
}
