import React, { useEffect, useState } from 'react'
import signin_img from '../../assets/signin_avatar.png'
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
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from "lucide-react";
import { MdOutlineEmail } from "react-icons/md";
import { FaRegUserCircle } from "react-icons/fa";
import { MdOutlinePassword } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import { Loader2Icon } from "lucide-react";
import type { SignupPayload } from '@/types/user'
import { useDispatch, useSelector } from 'react-redux'
import { signupUser } from './userSlice'
import type { AppDispatch, RootState } from '@/store/store'

const Signup: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const formSchema = z
    .object({
      username: z
        .string()
        .min(3, { message: "Email must be at least 3 characters." }),

      email: z
        .string()
        .min(5, { message: "Email must be at least 3 characters." })
        .max(50, { message: "Email must not exceed 50 characters." })
        .email({ message: "Please enter a valid email." }),

      password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters." })
        .max(32, { message: "Password must not exceed 32 characters." })
        .regex(/[0-9]/, { message: "Password must contain at least one number." })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
        .regex(/[@$!%*?&]/, { message: "Password must contain at least one special character." }),

      confirm_password: z
        .string()
        .min(8, { message: "Confirm password must be at least 8 characters." }),
    })
    .refine((data) => data.password === data.confirm_password, {
      message: "Passwords do not match.",
      path: ["confirm_password"],
    });


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirm_password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const payload: SignupPayload = {
      username: values.username,
      email: values.email,
      password: values.password
    }
    setIsLoading(true)
    await dispatch(signupUser(payload))
    setIsLoading(false)
  }
  const token = useSelector((state: RootState) => state.user.token)
  useEffect(() => {
    if (token) {
      navigate("/dashboard")
    }
  }, [token, navigate])
  return (
    <>
      <div className='h-screen flex'>
        {/* Left Section */}
        <div className='hidden xl:flex h-full justify-center items-center bg-grey-x100 lg:px-32 w-full'>
          <div className='flex flex-col justify-center items-center gap-8'>
            <div className='flex flex-col items-center gap-2'>
              <div className='md:text-2xl lg:text-4xl font-semibold text-center text-grey'>
                Start your journey with Tracero
              </div>
              <div className='text-base text-gray-600'>
                Signup to create an account
              </div>
            </div>
            <div>
              <img src={signin_img} alt="signin" className='w-[600px] h-auto' />
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className='h-full flex items-center justify-center bg-secondary-lite px-4 lg:px-32 w-full'>
          <Card className="w-full max-w-[460px] py-4 px-4 lg:py-6 sm:py-8 lg:px-6 shadow-lg border border-border rounded-xl">
            <CardHeader className="text-center xl:text-left">
              <CardTitle className="text-2xl xl:text-3xl text-grey">
                Create your account
              </CardTitle>
              <CardDescription className='mb-4 text-gray-600'>
                Fill in your details to create a new account
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700"> <MdOutlineEmail /> Email</FormLabel>
                        <FormControl>
                          <Input
                            className='bg-white border border-gray-300 focus:border-primary 
                            focus:ring-2 focus:ring-primary/30 font-medium text-gray-800 h-12 rounded-lg placeholder:text-gray-400'
                            type="email"
                            placeholder="your@email.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className='text-error text-sm' />
                      </FormItem>
                    )}
                  />

                  {/* username */}
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700"> <FaRegUserCircle /> Username</FormLabel>
                        <FormControl>
                          <Input
                            className='bg-white border border-gray-300 focus:border-primary 
                            focus:ring-2 focus:ring-primary/30 font-medium text-gray-800 h-12 rounded-lg placeholder:text-gray-400'
                            type="text"
                            placeholder="Pick a unique username"
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
                        <FormLabel className="text-gray-700"> <MdOutlinePassword /> Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Create a strong password"
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
                        <FormMessage className='text-error text-sm' />
                      </FormItem>
                    )}
                  />

                  {/* Confirm Password */}
                  <FormField
                    control={form.control}
                    name="confirm_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700"> <RiLockPasswordLine /> Confirm Password</FormLabel>
                        <FormControl>
                          <div className='relative'>
                            <Input
                              className='bg-white border border-gray-300 focus:border-primary 
                            focus:ring-2 focus:ring-primary/30 font-medium text-gray-800 h-12 rounded-lg placeholder:text-gray-400 pr-10'
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Re-enter your password"
                              {...field}
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
                        <FormMessage className='text-error text-sm' />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>

            <CardFooter className="flex-col gap-3 sm:gap-2">
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-primary text-white hover:bg-indigo-600 rounded-lg shadow-md"
                onClick={form.handleSubmit(onSubmit)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2Icon className="animate-spin mr-2" />
                    Sign Up
                  </>
                ) : (
                  <p>Sign Up</p>
                )}
              </Button>
              <span className="text-sm text-gray-500 font-medium">or</span>
              <Button
                variant="outline"
                className="w-full h-12 text-base border border-gray-300 hover:bg-gray-50 rounded-lg"
                disabled
              >
                Sign up with Google
              </Button>
              <span className='my-4 flex gap-2 text-sm text-gray-600'>
                <p>Already have an account?</p>
                <Link to="/auth?mode=signin">
                  <p className='text-primary font-semibold hover:underline'>Sign In</p>
                </Link>
              </span>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  )
}

export default Signup