import { createBrowserRouter } from "react-router-dom";
import StartPage from "../Pages/StartPage";
import CreateMessage from "../Pages/CreateMessage";
import App from "../App";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <StartPage />,
    loader: () => (document.title = "React start page || Start page"),
  },
  {
    path: "/app",
    element: <App />,
    loader: () => (document.title = "React start page || Start page"),
    children: [
      {
        path: "createMessage",
        element: <CreateMessage />,
      },
    ],
  },
]);
