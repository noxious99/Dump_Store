import { jwtDecode } from "jwt-decode";
import { logout } from "@/feature-component/auth/userSlice";

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
        const currentTime = Date.now() / 1000;
        const isTokenExpired = decoded.exp < currentTime;
        if (!decoded.user || isTokenExpired) {
            logout()
            return null
        }
        return decoded;
    } catch (error) {
        logout()
        return null
    }
}

export const getDaysLeftOfCurrentMonth = () => {
    const now = new Date();
    const currentDay = now.getDate();
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysLeft = lastDayOfMonth - currentDay;
    return daysLeft;
}