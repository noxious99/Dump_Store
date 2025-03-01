import React, { useState } from "react";
import "../styles/profileStyle.css";
import { useMediaQuery } from "react-responsive";
import { IoMdArrowDropupCircle } from "react-icons/io";
import { IoMdArrowDropdownCircle } from "react-icons/io";
import { MdOutlineSettingsSuggest } from "react-icons/md";
import axiosInstance from "../utils/axiosInstance";

export const Info = ({
  user,
  totalPosts,
  userDate,
  buddiesCount,
  currentGoal,
  onUserUpdate
}) => {
  const isMobile = useMediaQuery({ maxWidth: 1024 });

  const [expand, setExpand] = useState(false)
  const [usernameEditActive, setUsernameEditActive] = useState(false)
  const [emailEditActive, setEmailEditActive] = useState(false)
  const [updatedUsername, setUpdatedUsername] = useState("")
  const [updatedEmail, setUpdatedEmail] = useState("")

  const handleExpand = () => {
    setExpand(!expand)
  }

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updatedData = {};
      if (updatedUsername.length !== 0) {
        updatedData.username = updatedUsername;
      }
      if (updatedEmail.length !== 0) {
        updatedData.email = updatedEmail;
      }
      const res = await axiosInstance.patch("/api/user/update", updatedData);
      setUsernameEditActive(false);
      onUserUpdate(res.data)
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex flex-col gap-8 text-gray-300 mt-10 w-[88%] mb-10 lg:mb-[60px]">
      {!isMobile && <div className="flex flex-col gap-10 text-lg">
        <div>Active since: {userDate}</div>
        <div>Connected buddies: 0</div>
        <div>Total Post: 0</div>
      </div>}
      {!isMobile && <span className="text-lg text-gray-500 flex gap-3 items-center underline underline-offset-4">
        <MdOutlineSettingsSuggest className="text-3xl" />
        <p className="">General Settings</p> </span>}
      {/* Avatar Section */}
      <div className="flex gap-5 items-center">
        <strong className="text-lg w-[80px] mr-5">Avatar: </strong>
        <span>
          <img
            src="https://i.pinimg.com/736x/67/36/47/67364732f603e386d702f4541a219aec.jpg"
            className="w-20 h-20 lg:w-[100px] lg:h-[100px] rounded-full ring-blue-500 ring-offset-4"
          />
        </span>
        {!isMobile && (
          <span>
            <button className="px-4 py-2 bg-red-600 rounded">Update</button>
          </span>
        )}
      </div>

      {/* Username Section */}
      <div className="flex gap-5 items-center">
        <strong className="text-lg w-[80px] mr-5">Username: </strong>
        <span className="text-lg">
          {!isMobile ? (
            <input
              type="text"
              value={usernameEditActive ? updatedUsername : user.username}
              placeholder={user.username}
              className="bg-black text-white text-lg border-0 px-5 py-3 lg:min-w-[600px] rounded"
              readOnly={!usernameEditActive}
              onChange={(e) => setUpdatedUsername(e.target.value)}
            />
          ) : (
            user.username
          )}
        </span>
        {!isMobile && (
          <span>
            {!usernameEditActive && <button onClick={() => { setUsernameEditActive(true) }} className="px-4 py-2 bg-red-600 rounded">Update</button>}
            {usernameEditActive && <span className="flex gap-3">
              <button onClick={handleUpdate} className="px-4 py-2 bg-green-700 rounded">Save</button>
              <button onClick={() => {
                setUsernameEditActive(false);
                setUpdatedUsername("")
              }} className="px-4 py-2 bg-gray-500 rounded">Cancel</button> </span>}
          </span>
        )}
      </div>

      {/* Email Section */}
      <div className="flex gap-5 items-center">
        <strong className="text-lg w-[80px] mr-5">Email: </strong>
        <span className="text-lg">
          {!isMobile ? (
            <input
              type="text"
              value={emailEditActive ? updatedEmail : user.email}
              placeholder={user.email}
              className="bg-black text-white text-lg border-0 px-5 py-3 lg:min-w-[600px] rounded"
              readOnly={!emailEditActive}
              onChange={(e) => setUpdatedEmail(e.target.value)}
            />
          ) : (
            user.email
          )}
        </span>
        {!isMobile && (
          <span>
            {!emailEditActive && <button onClick={() => { setEmailEditActive(true) }} className="px-4 py-2 bg-red-600 rounded">Update</button>}
            {emailEditActive && <span className="flex gap-3">
              <button onClick={(e) => {
                handleUpdate(e);
                setEmailEditActive(false);
              }} className="px-4 py-2 bg-green-700 rounded">Save</button>
              <button onClick={() => {
                setEmailEditActive(false);
                setUpdatedEmail("")
              }} className="px-4 py-2 bg-gray-500 rounded">Cancel</button>
            </span>}
          </span>
        )}
      </div>

      {/* Password Section */}
      <div className="flex gap-5 items-center">
        <strong className="text-lg w-[80px] mr-5">Password: </strong>
        <span className="text-lg">
          {!isMobile ? (
            <input
              type="password"
              value="********"
              placeholder="********"
              className="bg-black text-white text-lg border-0 px-5 py-3 lg:min-w-[600px] rounded"
              readOnly
            />
          ) : (
            "********"
          )}
        </span>
        {!isMobile && (
          <span>
            <button className="px-4 py-2 bg-red-600 rounded">Update</button>
          </span>
        )}
      </div>
      {/* additional info for mobile*/}
      {isMobile ? (
        <>
          <div onClick={handleExpand} className="flex items-center text-md text-gray-500 gap-2">
            <p>Additional Info:</p>
            {expand ? <IoMdArrowDropupCircle className="text-lg" /> : <IoMdArrowDropdownCircle className="text-lg" />}
          </div>
          {expand && (
            <div className="flex flex-col gap-5 mt-[-20px]">
              <div>Connected buddies: 0</div>
              <div>Total Post: 0</div>
              <div>Active since: 0</div>
            </div>
          )}
        </>
      ) : null}

    </div>
  );
};
