import Signin from '@/feature-component/auth/Signin'
import Signup from '@/feature-component/auth/Signup'
import React, { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

const Auth:React.FC = () => {
    const navigate = useNavigate()
    const [params] = useSearchParams()
    const mode = params.get("mode")
    useEffect(()=> {
        if (!mode) {
            navigate("/auth?mode=signin", {replace: true})
        }

    },[mode, navigate])

  return mode === "signin" ? <Signin /> : <Signup />
}

export default Auth