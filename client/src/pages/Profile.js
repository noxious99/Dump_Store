import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import "../styles/profileStyle.css";
import { Info } from "../components/Info";
import { getPosts } from "../actions/postAction";
import MessageComponent from "../components/MessageComponent";
import moment from "moment";
import { FaUserEdit } from "react-icons/fa";
import { useMediaQuery } from "react-responsive";
import Featured from "../components/Featured";

//MUI
import { BiSolidUserDetail } from "react-icons/bi";
import { MdMessage } from "react-icons/md";

export const Profile = () => {

  const isMobile = useMediaQuery({ maxWidth: 1024 });
  const [detailsActive, setDetailsActive] = useState(true)
  const [user, setUser] = useState({})
  const [paging, setPaging] = useState("");
  
  const totalPosts = useSelector((state) => state.getPost.totalCount || 0);

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await axiosInstance.get("/api/user/profileinfo")
        setUser(res.data)
      }
      catch (err) {
        console.log(err)
      }
    }
    getUser()
  }, []);

  if (!user) {
    return <p>Loading...</p>
  }


  const formatDate = moment(user.date).fromNow();
  const userDate = formatDate.toString();

  const handlePaging = (val) => {
    setPaging(val);
    if (val === 1) {
      setDetailsActive(true)
    } else {
      setDetailsActive(false)
    }
  };

  const handleUserUpdate = (updatedData) => {
    setUser(updatedData)
  }

  const renderPaging = () => {
    switch (paging) {
      case 1:
        return <Info
          user={user}
          totalPosts={totalPosts}
          userDate={userDate}
          buddiesCount={0}
          currentGoal={0}
          onUserUpdate={handleUserUpdate} />
      case 2:
        return <MessageComponent />;
      default:
        return <Info
          user={user}
          totalPosts={totalPosts}
          userDate={userDate}
          buddiesCount={0}
          currentGoal={0}
          onUserUpdate={handleUserUpdate} />;
    }
  };

  return (
    <div>
      <div className="flex flex-col justify-center items-center">
        <div className="flex flex-col justify-center items-center mt-10 mb-10 lg:mt-[70px] lg:mb-[70px]">
          <div className="flex items-center gap-4">
            <div className="profilePic">
              <img src={user.avatar} loading="lazy" alt="avatar" className="w-[80px] h-[80px] lg:w-[100px] lg:h-[100px]" />
            </div>
            <div className="flex flex-col gap-2 lg:ml-4">
              <p className="text-gray-300 text-xl lg:text-3xl">{user.username}</p>
              <p className="text-gray-400 text-sm mt-[-8px] mr-[-8px]">{user.email}</p>
            </div>
            {isMobile ? (<div className="ml-2  mt-[-40px]">
              <Link to={`/EditProfile/${user._id}`} className="flex-col items-center justify-center">
                <FaUserEdit className="text-gray-400 mb-[-16px]" />
                <p className="text-[10px] text-gray-400">Edit</p>
              </Link>
            </div>) : null}
          </div>
          <div className="flex gap-2 text-gray-300 text-lg lg:text-2xl mt-5">
            <p>Total Collection:</p> {totalPosts === 0 ? <p className="">No posts available</p> : totalPosts}
          </div>
        </div>

        <div className="lg:flex lg:w-[100vw]">
          {!isMobile ? (<div className="lg:w-[30%] min-h-[500px]" style={{ backgroundColor: 'rgb(0,0,0,0.4)' }}>
            <Featured />
          </div>) : null}
          <div className="lg:w-[70%] w-[100vw]">
            <div className="flex justify-evenly blur-2 h-[60px] w-[100%]" style={{ backgroundColor: 'rgb(0,0,0,0.2)' }}>
              <button onClick={() => handlePaging(1)} className="flex items-center h-[100%] text-gray-300 text-md lg:text-xl gap-2 px-11 lg:px-[100px]"
                style={{
                  border: "solid #DC2626",
                  borderWidth: detailsActive ? "0px 0px 3px 0px" : "0px"
                }}>
                <BiSolidUserDetail className="text-[28px] lg:text-[40px]" />
                <p>Details</p>
              </button>
              <button onClick={() => handlePaging(2)} className="flex items-center h-[100%] text-gray-300 text-md lg:text-xl gap-2 px-11 lg:px-[100px]"
                style={{
                  border: "solid #DC2626",
                  borderWidth: !detailsActive ? "0px 0px 3px 0px" : "0px"
                }}>
                <MdMessage className="text-[24px] lg:text-[32px]" />
                <p>Messages</p>
              </button>
            </div>
            <div className="flex justify-center">{renderPaging()}</div>
          </div>
        </div>

      </div>
    </div>
  );
};
