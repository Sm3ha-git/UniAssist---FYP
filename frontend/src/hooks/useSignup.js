import { useState } from "react";
import toast from "react-hot-toast";
import { useAuthStore } from "../zustand/AuthStore";

const useSignup = () => {
  const [loading, setLoading] = useState(false);
  const { setAuthUser } = useAuthStore();

  const signup = async ({
    uniId,
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    gender,
    role,
    Department,
    title,
    schedule,
  }) => {
    const success = handleInputErrors({
      uniId,
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      gender,
      role,
      Department,
      title,
      schedule,
    });
    if (!success) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uniId,
          firstName,
          lastName,
          email,
          password,
          confirmPassword,
          gender,
          role,
          Department,
          title,
          schedule,
        }),
      });

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      localStorage.setItem("chat-user", JSON.stringify(data));
      setAuthUser(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { loading, signup };
};

export default useSignup;

function handleInputErrors({
  uniId,
  firstName,
  lastName,
  email,
  password,
  confirmPassword,
  gender,
  role,
  Department,
  title,
  schedule,
}) {
  if (
    !uniId ||
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    !confirmPassword ||
    !gender ||
    !role ||
    !Department ||
    !title
  ) {
    toast.error("Please fill in all fields");
    return false;
  }

  if (password !== confirmPassword) {
    toast.error("Passwords do not match");
    return false;
  }

  if (password.length < 6) {
    toast.error("Password must be at least 6 characters");
    return false;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    toast.error("Please enter a valid email address");
    return false;
  }

  // Schedule validation
  if (!schedule || schedule.length === 0) {
    toast.error("Please add at least one schedule entry");
    return false;
  }

  // Validate each schedule entry
  for (const entry of schedule) {
    if (!entry.subject || entry.subject.trim() === "") {
      toast.error("All schedule entries must have a subject");
      return false;
    }

    if (entry.mode === "campus" && (!entry.room || entry.room.trim() === "")) {
      toast.error("Please specify a room for campus classes");
      return false;
    }

    // Validate time format (assuming time is already formatted as string)
    if (!entry.startTime || !entry.endTime) {
      toast.error("All schedule entries must have start and end times");
      return false;
    }
  }

  return true;
}
