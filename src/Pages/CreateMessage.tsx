import { useNavigate } from "react-router-dom";

const CreateMessage = () => {
  const navigate = useNavigate();
  return (
    <>
      <div>Create Message</div>
      <button onClick={() => navigate("/")}>This is a button</button>
    </>
  );
};

export default CreateMessage;
