"use client";
import { montserrat } from "@/app/ui/fonts";
import { Button } from "@/app/ui/button";
import { useEffect, useState } from "react";
import { authenticate } from "../lib/actions";
import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginForm() {
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, setIsPending] = useState(false);
  // const [redirectToDashboard, setRedirectToDashboard] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    setIsPending(true);
    setErrorMessage(""); // Reset error message

    const formData = new FormData(event.target);
    const userId = formData.get("userId");
    const password = formData.get("password");

    try {
      if (typeof userId === "string" && typeof password === "string") {
        await authenticate({ userId, password });
      } else {
        console.error("Invalid form data");
      }

      // Poll for session status
      const intervalId = setInterval(async () => {
        const session = await getSession();
        if (session) {
          clearInterval(intervalId);
          // setIsPending(false);
          router.push("/dashboard");
          // setRedirectToDashboard(true);
        } else {
          setErrorMessage("Still unauthenticated, retrying...");
        }
      }, 500); // Check every 1/2 second
    } catch (error) {
      setErrorMessage(`Invalid Credential`);
    } finally {
      setIsPending(false);
    }
  };

  // useEffect(() => {
  //   if (redirectToDashboard) {
  //     router.push("/dashboard"); // Redirect after session is confirmed
  //   }
  // }, [redirectToDashboard, router]);

  // useEffect(() => {
  //   // Cleanup on unmount
  //   return () => {
  //     clearInterval(); // This should be defined properly if needed
  //   };
  // }, []);



  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-col items-center justify-center flex-1 rounded-lg bg-blue-200 px-6 pb-4 pt-8">
        <div className="mb-10  w-full flex flex-col items-center">
          <div className={`${montserrat.className} text-xl text-blue-600`}>
            OldCrux
          </div>
          <div className={`text-3xl text-blue-600`}>Fleet Dashboard</div>
        </div>
        <h1 className={`mb-3 text-2xl text-blue-800`}>Sign In</h1>
        <div className="w-full">
          <div>
            <label
              className="mt-5 block text-lg font-medium text-blue-800"
              htmlFor="userId"
            >
              Username
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border text-black border-gray-200 py-[9px] pl-2 text-sm outline-2 placeholder:text-gray-500"
                id="userId"
                type="text"
                name="userId"
                placeholder="Enter your userId"
                required
              />
            </div>
          </div>
          <div className="mt-4">
            <label
              className="mt-5 block text-lg font-medium text-blue-800"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border text-black border-gray-200 py-[9px] pl-2 text-sm outline-2 placeholder:text-gray-500"
                id="password"
                type="password"
                name="password"
                placeholder="Enter password"
                required
                minLength={5}
              />
            </div>
          </div>
        </div>
        <Button
          className="mt-4 w-full flex justify-center"
          aria-disabled={isPending}
        >
          {isPending ? "Logging in..." : "Log in"}
        </Button>

        <Button
          className="mt-4 flex bg-transparent hover:bg-transparent active:bg-transparent p-0"
          onClick={() => signIn("google")}
          style={{ width: "auto", height: "auto" }}
        >
          <Image
            alt="Google Sign In"
            src={`/images/google_signin.svg`}
            width={150}
            height={150}
            className="object-contain"
          />
        </Button>

        <div
          className="flex h-8 items-end space-x-1"
          aria-live="polite"
          aria-atomic="true"
        >
          {errorMessage && (
            <p className="text-sm text-red-500">{errorMessage}</p>
          )}
        </div>
      </div>
    </form>
    </>
  );
}
