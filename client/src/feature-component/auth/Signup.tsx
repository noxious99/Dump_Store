import React from 'react'
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
import { Link } from 'react-router-dom'

const Signup: React.FC = () => {
  const formSchema = z.object({
    email: z.string().min(3, {
      message: "Plaese enter a valid email",
    }),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters."
    }),
    confirm_password: z.string().min(8, {
      message: "Password did not match."
    }),
  })
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirm_password: "",
    },
  })
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }
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
                Enter your credentials to access your account
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
                        <FormLabel className="text-gray-700">Email</FormLabel>
                        <FormControl>
                          <Input
                            className='bg-white border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/30 font-medium text-gray-800 h-12 rounded-lg'
                            type="email"
                            placeholder="Enter your email"
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
                        <FormLabel className="text-gray-700">Password</FormLabel>
                        <FormControl>
                          <Input
                            className='bg-white border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/30 font-medium text-gray-800 h-12 rounded-lg'
                            type="password"
                            placeholder="Enter your password"
                            {...field}
                          />
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
                        <FormLabel className="text-gray-700">Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            className='bg-white border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/30 font-medium text-gray-800 h-12 rounded-lg'
                            type="password"
                            placeholder="Confirm your password"
                            {...field}
                          />
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
              >
                Sign Up
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