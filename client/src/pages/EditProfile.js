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
  const [photo, setPhoto] = useState(null); // State for the uploaded photo
  const [isUpdated, setIsUpdated] = useState(false);

  const {
    username: UserName,
    email: userEmail,
    avatar: userAvatar,
  } = useSelector((state) => state.auth.userInfo || []);

  const profileImg = useSelector((state) => state.auth.userInfo.avatar || []);

  useEffect(() => {
    if (UserName && userEmail) {
      setName(UserName);
      setEmail(userEmail);
      setPhoto(userAvatar);
    }
  }, [UserName, userEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    // Only append the photo if it's been set (i.e., the user has chosen a new photo)
    if (photo && photo !== userAvatar) {
      formData.append("avatar", photo); // Append the uploaded photo if it's new
    }

    dispatch(userUpdate(id, formData)).then(() => {
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
          <label>User Name</label>
          <input
            type="text"
            placeholder="User Name"
            value={username}
            onChange={(e) => setName(e.target.value)}
          />
          <label>User Email</label>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <div>
              <img
                src={profileImg}
                style={{
                  width: "60px",
                  height: "auto",
                  alignSelf: "center",
                  borderRadius: "50%",
                  margin: "5px",
                }}
              />
            </div>
            <div>
              <span>Current Avatar</span>
            </div>
          </div>
          <input type="file" onChange={(e) => setPhoto(e.target.files[0])} />{" "}
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
