import "./App.css";
import { Outlet } from "react-router-dom";
import { MyProvider } from "./provider/MyProvider";

function App() {
  return (
    <>
      <MyProvider>
        <Outlet />
      </MyProvider>
    </>
  );
}

export default App;
