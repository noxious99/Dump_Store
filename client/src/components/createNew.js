import React, { useState } from "react";
import FileBase from "react-file-base64";
import { useDispatch, useSelector } from "react-redux";
import { postAction } from "../actions/postAction";
import "../styles/profileStyle.css";

export const CreateNew = () => {
  const [title, setTitle] = useState("");
  const [description, setdescription] = useState("");
  const [selectedFile, setSelectedFile] = useState("");

  const { isLoading, success, error } = useSelector((state) => state.post);

  const dispatch = useDispatch();
  const handleSubmit = (e) => {
    e.preventDefault();
    const post = {
      title: title,
      text: description,
      image: selectedFile,
    };

    dispatch(postAction(post));
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
          <FileBase
            type="file"
            multiple={false}
            onDone={({ base64 }) => setSelectedFile(base64)}
            id="fileInput"
            style={{ display: "none" }}
          />
        </div>
        <button disabled={isLoading}>
          {" "}
          {isLoading ? "Uploading" : "Add"}{" "}
        </button>
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
