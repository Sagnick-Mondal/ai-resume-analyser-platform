import { usePuterStore } from "~/lib/puter";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";

export const meta = () => [
  { title: "ResumePort | Auth" },
  { name: "description", content: "Log into your account" },
];
// This is the authentication route for the application
// It handles user login and logout functionality
// and redirects users based on their authentication status
const Auth = () => {
  const { isLoading, auth } = usePuterStore();
  const location = useLocation();// Get the current location to extract query parameters
  const next = location.search.split("next=")[1];// Extract the 'next' parameter from the URL
  const navigate = useNavigate();

  // If the user is authenticated, redirect them to the next page or home
  useEffect(() => {
    if (auth.isAuthenticated) navigate(next || "/");
  }, [auth.isAuthenticated, next]);

  return (
    <main className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950 min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <section className="bg-[#F7F7F8]/10 border border-white/20 rounded-3xl shadow-2xl p-10 space-y-8 backdrop-blur-md backdrop-saturate-150 transition-all duration-300">
          <div className="text-center space-y-2">
            <h1 className="">Welcome</h1>
            <h2 className="text-lg !text-gray-300">
              Log in to continue your Resume Analysis
            </h2>
          </div>

          <div className="w-full">
            {/* Show a loading spinner if the authentication is in progress */}
            {/* Otherwise, show the login or logout button based on authentication status */}
            {/* The button will either log the user in or out based on their current authentication state */}
            {isLoading ? (
              <button
                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-sky-400 via-gray-300 to-rose-400 text-white text-lg font-medium animate-pulse shadow-md cursor-not-allowed"
                aria-label="Signing you in..."
              >
                Signing you in...
              </button>
            ) : (
              <>
                {auth.isAuthenticated ? (
                  <button
                    className="w-full py-3 px-6 rounded-xl bg-red-500 hover:bg-red-600 transition text-white text-lg font-medium shadow-lg"
                    onClick={auth.signOut}
                    aria-label="Log Out"
                  >
                    Log Out
                  </button>
                ) : (
                  <button
                    className="w-full py-3 px-6 rounded-xl bg-[#10A37F] hover:bg-[#0B8A6A] transition text-white text-lg font-medium shadow-lg"
                    onClick={auth.signIn}
                    aria-label="Log In"
                  >
                    Log In
                  </button>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
};

export default Auth;
