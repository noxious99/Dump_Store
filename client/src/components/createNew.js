import React, { useState } from "react";
import FileBase from "react-file-base64";
import { useDispatch } from "react-redux";
import { postAction } from "../actions/postAction";

export const CreateNew = () => {
  const [title, setTitle] = useState("");
  const [description, setdescription] = useState("");
  const [selectedFile, setSelectedFile] = useState("");

  const dispatch = useDispatch();
  const handleSubmit = (e) =>
  {
    e.preventDefault();
    const post = {
        title: title,
        text: description,
        image: selectedFile
    }

    dispatch(postAction(post));
  }
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="input your title"
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setdescription(e.target.value)}
          placeholder="add a description"
        />
          <div><FileBase
            type="file"
            multiple={false}
            onDone={({ base64 }) => setSelectedFile(base64)}
          /></div>
        <button> Add!</button>
      </form>
    </div>
  );
};
