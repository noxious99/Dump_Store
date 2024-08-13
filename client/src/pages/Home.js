import React from 'react'
import { Link } from 'react-router-dom'

export const Home = () => {
  return (
    <div>Home
    <Link to={"/Register"}>Register</Link>
    <Link to={"/Login"}>Login</Link>
    <Link to={"/Profile"}>Profile</Link>
    </div>
  )
}
