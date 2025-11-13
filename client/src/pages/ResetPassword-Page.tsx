import React, { useState } from 'react'
import type { ResetPasswordPayload } from '@/types/user'
import { useSearchParams } from 'react-router-dom'
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
import { MdOutlinePassword } from "react-icons/md";
import { MdOutlineEmail } from "react-icons/md";
import axiosInstance from '@/utils/axiosInstance'

const ResetPassword: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState({
        type: "success",
        msg: ""
    })
    const [params] = useSearchParams()
    const token = params.get("token")

    const reqFormSchema = z.object({
        email: z.email({ message: "Please enter a valid email address." }),
    })

    const reqForm = useForm<z.infer<typeof reqFormSchema>>({
        resolver: zodResolver(reqFormSchema),
        defaultValues: { email: "" },
    })

    const formSchema = z.object({
        password: z
            .string()
            .min(8, { message: "Password must be at least 8 characters long." })
            .max(32, { message: "Password cannot exceed 32 characters." }),
        confirmPassword: z
            .string()
            .min(8, { message: "Password must be at least 8 characters long." })
            .max(32, { message: "Password cannot exceed 32 characters." }),
    })
        .refine((data) => data.password === data.confirmPassword, {
            path: ["confirmPassword"],
            message: "Passwords do not match.",
        })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const payload: ResetPasswordPayload = {
            token: token || "",
            newPassword: values.password,
        };
        setIsLoading(true)
        try {
            const res = await axiosInstance.post("/v1/user/password/reset", payload)
            if (res.status === 200) {
                setMessage({
                    type: "success",
                    msg: "Your password has been updated, please login with the new password",
                })
            }
        } catch (error: any) {
            console.error(error)
            const errorMsg =
                error?.message ||
                "Failed to update your password. Please try again later."
            setMessage({
                type: "failed",
                msg: errorMsg,
            })
        } finally {
            setIsLoading(false)
        }
    }

    const reqForPassword = async (values: z.infer<typeof reqFormSchema>) => {
        setIsLoading(true)
        try {
            const res = await axiosInstance.post("/v1/user/password/forgot", {
                email: values.email
            })

            if (res.status === 200) {
                setMessage({
                    type: "success",
                    msg: "A password reset link has been sent to your email address.",
                })
            }
        } catch (error: any) {
            console.error(error)
            const errorMsg =
                error?.message ||
                "Failed to send the password reset link. Please try again later."
            setMessage({
                type: "failed",
                msg: errorMsg,
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex justify-center items-center min-h-[650px] px-4">
            <Card className="w-full max-w-[400px] py-4 px-4 lg:py-6 sm:py-8 lg:px-6 shadow-lg border border-border rounded-xl">
                <CardHeader className="text-center xl:text-left">
                    <CardTitle className="text-2xl xl:text-3xl text-gray-800">
                        Reset Your Password
                    </CardTitle>
                    <CardDescription className="mb-4 text-gray-600 text-sm">
                        {token
                            ? "Enter your new password."
                            : "Enter your email for reset link."}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {token ? (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                {/* Password Field */}
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-700 flex items-center gap-1">
                                                <MdOutlinePassword /> New Password
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type={showPassword ? "text" : "password"}
                                                        placeholder="Enter new password"
                                                        {...field}
                                                        className="bg-white border border-gray-300 focus:border-primary 
                                                                  focus:ring-2 focus:ring-primary/30 font-medium text-gray-800 h-12 rounded-lg placeholder:text-gray-400 pr-10"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                    >
                                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-error text-sm" />
                                        </FormItem>
                                    )}
                                />

                                {/* Confirm Password Field */}
                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-700 flex items-center gap-1">
                                                <MdOutlinePassword /> Confirm Password
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        placeholder="Re-enter new password"
                                                        {...field}
                                                        className="bg-white border border-gray-300 focus:border-primary 
                                                                  focus:ring-2 focus:ring-primary/30 font-medium text-gray-800 h-12 rounded-lg placeholder:text-gray-400 pr-10"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                    >
                                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-error text-sm" />
                                        </FormItem>
                                    )}
                                />
                            </form>
                        </Form>
                    ) : (
                        <>
                            <Form {...reqForm}>
                                <form onSubmit={reqForm.handleSubmit(reqForPassword)} className="space-y-4">
                                    <FormField
                                        control={reqForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-700 flex items-center gap-1">
                                                    <MdOutlineEmail /> Email Address
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            type="text"
                                                            placeholder="you@example.com"
                                                            {...field}
                                                            className="bg-white border border-gray-300 focus:border-primary 
                                                                  focus:ring-2 focus:ring-primary/30 font-medium text-gray-800 h-12 rounded-lg placeholder:text-gray-400 pr-10"
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="text-error text-sm" />
                                            </FormItem>
                                        )}
                                    />
                                </form>
                            </Form>
                        </>
                    )}
                </CardContent>

                <CardFooter className="flex-col gap-3 sm:gap-2">
                    <div className={`${message.type === 'success' ? 'text-green-600' : 'text-red-500'} text-sm`}>
                        {message.msg && message.msg}
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 text-base font-semibold bg-primary text-white hover:bg-indigo-600 rounded-lg shadow-md"
                        onClick={token ? form.handleSubmit(onSubmit) : reqForm.handleSubmit(reqForPassword)}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2Icon className="animate-spin mr-2" />
                                {token ? "Updating Password..." : "Sending Request..."}
                            </>
                        ) : (
                            <p>{token ? "Update Password" : "Send Reset Link"}</p>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

export default ResetPassword
