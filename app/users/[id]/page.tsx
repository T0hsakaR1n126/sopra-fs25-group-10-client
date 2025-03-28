"use client";

import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { useLogout } from "@/utils/useLogout";
import { App, Button, Card, Input, message, Tag } from "antd";
import dayjs from "dayjs";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
import { DatePicker } from "antd";



const UserProfile: React.FC = () => {
  const router = useRouter();
  const { id } = useParams();
  const apiService = useApi();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newUsername, setNewUsername] = useState<string>("");
  const [birthdate, setBirthdate] = useState<string | null>(null);
  const [birthdateError, setBirthdateError] = useState<string | null>(null);
  
  const handleLogout = useLogout();
  const { value: loggedInUserId } = useLocalStorage<string>("currentUserId", "");
  const { value: token } = useLocalStorage<string>("token", "");
  
  const [messageApi, contextHolder] = message.useMessage();
  // //console.log("token from single user profile", token);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!token) return;
    
    const fetchUser = async () => {
      try {
        const userData: User = await apiService.get<User>(`/users/${id}`, {
          headers: { userToken: token },
        });
        
        setUser(userData);
        setNewUsername(userData.username ?? "");
        setBirthdate(userData.birthday ?? null);
      } catch (error: unknown) {
        const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "User not found!";
        
        messageApi.error({
          content: errorMessage,
          style: {
            color: "black",
          },
        });
        
        setTimeout(() => {
          router.push("/users"); // Redirect after delay
        }, 1500) ;}
        finally {
          setLoading(false);
        }
      };
      
      fetchUser();
      
      fetchUser();
    }, [apiService, id, token]); 
    
    const handleDateSelect = (date: dayjs.Dayjs | null) => {
      if (!date) {
        setBirthdate(null);
        setBirthdateError("Please enter a valid birthdate.");
        return;
      }
      
      const selectedDate = date.format("YYYY-MM-DD");
      
      if (!dayjs(selectedDate, "YYYY-MM-DD", true).isValid()) {
        setBirthdateError("Invalid date format. Please use YYYY-MM-DD.");
        setBirthdate(null);
        return;
      }
      
      if (dayjs(selectedDate).isAfter(dayjs(), "day")) {
        setBirthdateError("Birthdate cannot be in the future.");
        setBirthdate(null);
      } else {
        setBirthdateError(null);
        setBirthdate(selectedDate);
      }
    };
    
    
    const handleSave = async () => {
      if (!user) return;
      
      if (!token) {
        messageApi.error("Authentication error. Please log in again.");
        return;
      }
      
      const updatedFields: Partial<User> = {};
      if (newUsername !== user.username) {
        updatedFields.username = newUsername;
      }
      if (birthdate !== user.birthday) {
        updatedFields.birthday = birthdate ? dayjs(birthdate).format("YYYY-MM-DD") : null;
      }
      
      if (Object.keys(updatedFields).length === 0) {
        messageApi.info({
          content: "No changes made.",
          style: { color: "#000", borderRadius: "8px", fontWeight: "bold" },
        });
        setEditing(false);
        return;
      }
      
      try {
        await apiService.put<User>(
          `/users/${id}`,
          updatedFields,
          { headers: { userToken: token } }
        );
        
        messageApi.success({
          content: "Profile updated successfully.",
          style: { color: "black", borderRadius: "8px", fontWeight: "bold" },
        });
        
        // Re-fetch user data
        const refreshedUser = await apiService.get<User>(`/users/${id}`, {
          headers: { userToken: token },
        });
        
        setUser(refreshedUser);
        setEditing(false);
      } catch (error: unknown) {
        
        let errorMessage = "An unknown error occurred";
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (
          (error as { response?: { data?: { message?: string } } })?.response?.data?.message
        ) {
          errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message ?? "An unknown error occurred";
        }
        
        messageApi.error({
          content: `Error: ${errorMessage}`,
          style: { color: "black", borderRadius: "8px", fontWeight: "bold" },
        });
      }
    };
    
    
    
    if (loading) return <p>Loading...</p>;
    
    return (
      <App>
      {contextHolder} {/* Required for message API to work */}
      <div className="card-container">
      <Card title={`${user?.username || "Unknown"}'s Profile`} className="profile-card">
      <p>
      <strong>Username:</strong>{" "}
      {editing ? (
        <div>
        <Input
        style={{ width: "100%" , background: "white", color: "black"}}
        placeholder="Enter new username"
        value={newUsername} 
        onChange={(e) => setNewUsername(e.target.value)} 
        />
        {newUsername.trim() === "" && (
          <div style={{ color: "red", marginTop: 5 }}>
          <strong>Username cannot be empty</strong>
          </div>
        )}
        </div>
      ) : (
        user?.username || "No username set"
      )}
      </p>
      
      
      <p>
      <strong>Status:</strong>{" "}
      <Tag color={user?.status === "ONLINE" ? "green" : "red"}>{user?.status}</Tag>
      </p>
      
      <p><strong>Created On:</strong> {user?.creationDate ? dayjs(user.creationDate).format("YYYY-MM-DD") : "Not available"}</p>
      
      
      {/* Birth Date Picker */}
      
      <div>
      <strong>Birth Date:</strong>{" "}
      {editing ? (
        <div>
        <DatePicker
        value={birthdate ? dayjs(birthdate) : null}
        onChange={handleDateSelect}
        format="YYYY-MM-DD"
        disabledDate={(current) => current && current > dayjs().endOf("day")} // Disable future dates
        style={{ width: "100%" , background: "white", color: "black"}}
        className="w-full"
        />
        {birthdateError && (
          <div style={{ color: "red", marginTop: 5 }}>
          <strong>{birthdateError}</strong>
          </div>
        )}
        </div>
      ) : (
        <span className="text-green-500">{birthdate ? dayjs(birthdate).format("YYYY-MM-DD") : "Not set"}</span>
      )}
      </div>  
      
      
      {/* Allow editing only if the logged-in user is viewing their own profile */}
      {String(loggedInUserId) === String(id) && (
        editing ? (
          <Button
          type="primary"
          onClick={handleSave}
          style={{
            marginTop: 10,
            backgroundColor: !newUsername.trim() ? "#d9d9d9" : "", // Light gray for disabled
            borderColor: !newUsername.trim() ? "#bfbfbf" : "", // Light gray border for disabled
            color: !newUsername.trim() ? "#a6a6a6" : "", // Gray text color for disabled
          }}
          disabled={!newUsername.trim()}
          >
          Save Changes
          </Button>
        ) : (
          <Button 
          type="default"
          onClick={() => setEditing(true)} 
          style={{ marginTop: 10 }}
          >
          Edit Profile
          </Button>
        )
      )}
      
      
      <div style={{ marginTop: 20, display: "flex", gap: "25px" }}>
      <Button type="primary" 
      style={{ backgroundColor: "#24a3d5"}}
      onClick={() => router.push("/users")}>
      Dashboard
      </Button>
      <Button type="primary" onClick={handleLogout}>
      Logout
      </Button>
      </div>
      </Card>
      </div>
      </App>
    );
  };
  
  export default UserProfile;
  