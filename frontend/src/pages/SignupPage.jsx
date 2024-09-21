import { useState } from "react";
import { Link } from "react-router-dom";
import { UserPlus, Mail, Lock, User, ArrowRight, Loader } from "lucide-react";
import { motion } from "framer-motion";
import InputField from "./InputField";
import useUserStore from "../store/useUserStore";

function SignupPage() {
 

  const loading = false;
  const [formDate, setFormDate] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const {signup} = useUserStore();

  const handleSubmit =  (e) => {
    e.preventDefault();
    // Submit form to the server
    // console.log(formDate);
     signup(formDate);

      // Clear form fields after successful signup
      setFormDate({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
  };
  return (
    <div className=" flex flex-col justify-center py-5 sm:px-6 lg:px-8">
      <motion.div
        className="sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="mt-6 text-center text-3xl font-extrabold  text-emerald-400">
          Create you account
        </h2>
      </motion.div>

      <motion.div
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 ">
          <form onSubmit={handleSubmit} className=" space-y-6">
            {/* Full Name Field */}
            <InputField
              label="Full Name"
              icon={User}
              type="text"
              id="name"
              value={formDate.name}
              onChange={(e) =>
                setFormDate({ ...formDate, name: e.target.value })
              }
              placeholder="John Doe"
            />

            {/* Email Field */}
            <InputField
              label="Email Address"
              icon={Mail}
              type="email"
              id="email"
              value={formDate.email}
              onChange={(e) =>
                setFormDate({ ...formDate, email: e.target.value })
              }
              placeholder="johndoe@gmail.com"
            />

            {/* Password Field */}
            <InputField
              label="Password"
              icon={Lock}
              type="password"
              id="password"
              value={formDate.password}
              onChange={(e) =>
                setFormDate({ ...formDate, password: e.target.value })
              }
              placeholder="*****"
            />

            {/* Confirm Password Field */}
            <InputField
              label="Confirm Password"
              icon={Lock}
              type="password"
              id="confirmPassword"
              value={formDate.confirmPassword}
              onChange={(e) =>
                setFormDate({ ...formDate, confirmPassword: e.target.value })
              }
              placeholder="*****"
            />

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent 
							rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600
							 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2
							  focus:ring-emerald-500 transition duration-150 ease-in-out disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader
                    className="mr-2 h-5 w-5 animate-spin"
                    aria-hidden="true"
                  />
                  Loading...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-5 w-5" aria-hidden="true" />
                  Sign up
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-emerald-400 hover:text-emerald-300"
            >
              Login here <ArrowRight className="inline h-4 w-4" />
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default SignupPage;

{
  /* <>
<div>
              <label htmlFor="name">Full Name</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className=" absolute inset-y-0 left-0 pl-3 flex items-center  pointer-events-none">
                  <User
                    size={18}
                    className="text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                <input
                  type="text"
                  id="name"
                  required
                  value={formDate.name}
                  onChange={(e) =>
                    setFormDate({ ...formDate, name: e.target.value })
                  }
                  className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500  sm:text-sm"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email">Email Address</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className=" absolute inset-y-0 left-0 pl-3 flex items-center  pointer-events-none">
                  <Mail
                    size={18}
                    className="text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                <input
                  type="email"
                  id="email"
                  required
                  value={formDate.email}
                  onChange={(e) =>
                    setFormDate({ ...formDate, email: e.target.value })
                  }
                  className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500  sm:text-sm"
                  placeholder="johndoe@gmail.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password">Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className=" absolute inset-y-0 left-0 pl-3 flex items-center  pointer-events-none">
                  <Lock
                    size={18}
                    className="text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                <input
                  type="password"
                  id="password"
                  required
                  value={formDate.password}
                  onChange={(e) =>
                    setFormDate({ ...formDate, password: e.target.value })
                  }
                  className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500  sm:text-sm"
                  placeholder="*******"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className=" absolute inset-y-0 left-0 pl-3 flex items-center  pointer-events-none">
                  <Lock
                    size={18}
                    className="text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                <input
                  type="password"
                  id="confirmPassword"
                  required
                  value={formDate.confirmPassword}
                  onChange={(e) =>
                    setFormDate({
                      ...formDate,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500  sm:text-sm"
                  placeholder="*******"
                />
              </div>
            </div>
</> */
}
