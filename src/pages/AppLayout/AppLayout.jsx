import Map from "../../components/Map/Map";
import Sidebar from "../../components/Sidebar/Sidebar";
import styles from "./AppLayout.module.css";
import User from "../../components/User/User";
import { useAuth } from "../../contexts/FakeAuthContext/FakeAuthContext";

function AppLayout() {
  const { isAuthenticated } = useAuth();

  return (
    <div className={styles.app}>
      <Sidebar />
      {isAuthenticated && <User />}
      <Map />
    </div>
  );
}

export default AppLayout;
