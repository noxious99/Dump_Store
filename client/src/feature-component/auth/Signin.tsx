import React, { useEffect, useState } from 'react'
import type { LoginPayload } from '@/types/user'
import type { RootState, AppDispatch } from '@/store/store'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser } from './userSlice'
import { Link, useNavigate } from 'react-router-dom'
import AuthShell from './AuthShell'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Eye, EyeOff, Loader2Icon } from "lucide-react";
import { MdOutlineEmail, MdOutlinePassword } from "react-icons/md";

const Signin: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [loginFailedMessage, setLoginFailedMessage] = useState("")

    const dispatch = useDispatch<AppDispatch>()
    const navigate = useNavigate()

    const formSchema = z.object({
        email: z
            .string()
            .email({ message: "Please enter a valid email address." }),
        password: z
            .string()
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: ""
        },
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const payload: LoginPayload = {
            identifier: values.email,
            password: values.password,
        };
        setIsLoading(true)
        const res: any = await dispatch(loginUser(payload));
        if (res.error) {
            let errorMsg = res.payload
            setLoginFailedMessage(errorMsg)
        } else {
            setLoginFailedMessage("")
        }
        setIsLoading(false)
    }

    const token = useSelector((state: RootState) => state.user.token)
    useEffect(() => {
        if (token) {
            navigate('/dashboard')
        }
    }, [token, navigate])

    return (
        <AuthShell
            headline="Welcome back."
            sub="Sign in and pick up where you left off."
        >
                <Card className="w-full max-w-[440px] border-0 shadow-none xl:shadow-xl xl:border xl:border-border">
                    <CardHeader className="text-center xl:text-left space-y-2 pb-6">
                        <CardTitle className="text-2xl xl:text-3xl font-bold text-foreground">
                            Sign in to your account
                        </CardTitle>
                        <CardDescription className='text-muted-foreground'>
                            Enter your credentials to access your account
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                {/* Email */}
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-foreground font-medium flex items-center gap-2">
                                                <MdOutlineEmail className="text-muted-foreground" />
                                                Email
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    placeholder="your@email.com"
                                                    className='h-12 bg-muted border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg'
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className='text-error text-sm' />
                                        </FormItem>
                                    )}
                                />

                                {/* Password */}
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-foreground font-medium flex items-center gap-2">
                                                <MdOutlinePassword className="text-muted-foreground" />
                                                Password
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type={showPassword ? "text" : "password"}
                                                        placeholder="Enter your password"
                                                        className='h-12 bg-muted border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg pr-12'
                                                        {...field}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                    >
                                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                </div>
                                            </FormControl>
                                            <FormMessage className='text-error text-sm' />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex justify-end">
                                    <Link
                                        to="/reset-password"
                                        className='text-sm text-primary hover:text-accent font-medium transition-colors'
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                            </form>
                        </Form>
                    </CardContent>

                    <CardFooter className="flex-col gap-4 pt-2">
                        {loginFailedMessage && (
                            <div className='w-full p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm font-medium text-center'>
                                {loginFailedMessage}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-semibold bg-primary hover:bg-accent rounded-lg shadow-md transition-all duration-200"
                            onClick={form.handleSubmit(onSubmit)}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2Icon className="animate-spin mr-2" size={18} />
                                    Signing in...
                                </>
                            ) : (
                                "Sign in"
                            )}
                        </Button>

                        <div className="flex items-center gap-4 w-full">
                            <div className="flex-1 h-px bg-border" />
                            <span className="text-sm text-muted-foreground">or</span>
                            <div className="flex-1 h-px bg-border" />
                        </div>

                        <Button
                            variant="outline"
                            className="w-full h-12 text-base font-medium border-2 border-border hover:bg-muted rounded-lg"
                            disabled
                        >
                            Sign in with Google
                        </Button>

                        <p className='mt-4 text-sm text-muted-foreground'>
                            Don't have an account?{' '}
                            <Link to="/auth?mode=signup" className='text-primary hover:text-accent font-semibold transition-colors'>
                                Sign up
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
        </AuthShell>
    )
}

export default Signin
