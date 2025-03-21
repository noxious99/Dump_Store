import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { postAction } from "../actions/postAction";
import "../styles/profileStyle.css";

export const CreateNew = () => {
  const [title, setTitle] = useState("");
  const [description, setdescription] = useState("");
  const [photo, setPhoto] = useState("");

  const { isLoading, success, error } = useSelector((state) => state.post);

  const dispatch = useDispatch();
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append("title", title);
    formData.append("text", description);
    if (photo) {
      formData.append("image", photo);
    }

    dispatch(postAction(formData));
  };
  return (
    <div className="postForm">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="input your title"
        />
        <input
          id="word_box"
          type="text"
          value={description}
          onChange={(e) => setdescription(e.target.value)}
          placeholder="add a description"
        />
        <div id="fileSelect">
          <input type="file" onChange={(e) => setPhoto(e.target.files[0])} />
        </div>
        <button disabled={isLoading}>{isLoading ? "Uploading" : "Add"}</button>
        {success ? (
          <div
            style={{
              width: "200px",
              backgroundColor: "#0f3803",
              textAlign: "center",
              color: "white",
              padding: "5px",
              borderRadius: "3px",
              boxShadow: "3px 3px 10px black",
            }}
          >
            <p>Successfully Added!!</p>
          </div>
        ) : (
          <div></div>
        )}
        {error ? (
          <div
            style={{
              width: "200px",
              backgroundColor: "#ff0000",
              textAlign: "center",
              color: "white",
              padding: "5px",
              borderRadius: "3px",
              boxShadow: "3px 3px 10px black",
            }}
          >
            <p>Error Occured!!</p>
          </div>
        ) : (
          <div></div>
        )}
      </form>
    </div>
  );
};
