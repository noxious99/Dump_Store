import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { userUpdate } from "../actions/userAction";
import FaceRetouchingNaturalIcon from "@mui/icons-material/FaceRetouchingNatural"; // Assuming you're using Material-UI

export const EditProfile = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const [username, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isUpdated, setIsUpdated] = useState(false);

  const { username: UserName, email: userEmail } = useSelector(
    (state) => state.auth.userInfo || []
  );

  useEffect(() => {
    if (UserName && userEmail) {
      setName(UserName);
      setEmail(userEmail);
    }
  }, [UserName, userEmail]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const userData = {
      username,
      email,
    };
    dispatch(userUpdate(id, userData)).then(() => {
      setIsUpdated(true);
      setTimeout(() => setIsUpdated(false), 3000);
    });
  };

  return (
    <div className="container">
      <div className="registerContainer">
        <div className="title">
          <FaceRetouchingNaturalIcon sx={{ fontSize: 40 }} />
          <h2>Update Profile Details</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="User Name"
            value={username}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="buttonBasic">
            Update Profile
          </button>
          {isUpdated && (
            <p style={{ color: "green", marginTop: "10px" }}>
              Profile updated successfully!
            </p>
          )}
        </form>
      </div>
    </div>
  );
};
