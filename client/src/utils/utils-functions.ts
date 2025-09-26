import { jwtDecode } from "jwt-decode";
import {logout} from "@/feature-component/auth/userSlice"

interface User {
    id: string,
    username: string,
    email: string,
    name: string,
    avatar: string
}
interface MyJwtPayload {
  user: User;
  exp: number;
  iat?: number;
}

export function getUserFromToken(token: string): MyJwtPayload | null {
    try {
        const decoded = jwtDecode<MyJwtPayload>(token);
        console.log("decode: ", decoded)
        if (!decoded.user) {
            logout()
            return null
        }
        return decoded;
    } catch (error) {
        return null;
    }
}