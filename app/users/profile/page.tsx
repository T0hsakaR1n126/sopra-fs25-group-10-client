"use client";
import { useEffect, useState } from "react";
import { Input, Button, Form } from "antd";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user"
import { useParams, useRouter } from "next/navigation";
import useLocalStorage from "@/hooks/useLocalStorage";
// import Authenticator from "@/auth/authenticator";

const ProfilePage = () => {
  const router = useRouter();
  const apiService = useApi();
  const id = useParams().id;
  const {
    value: token, // is commented out because we do not need the token value
  } = useLocalStorage<string>("token", "");

  const [form] = Form.useForm();
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const avatar = ["/avatar_1.png", "/avatar_2.png", "/avatar_3.png", "/avatar_4.png", "/avatar_5.png", "/avatar_6.png"];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response: User = await apiService.get<User>(`/users/${id}/profile`);
        setUser(response);
      } catch (error) {
        if (error instanceof Error) {
          alert(`Something went wrong while fetching user:\n${error.message}`);
          router.push("/lobby");
        } else {
          console.error("An unknown error occurred while fetching user.");
        }
      }
    };

    fetchUser();
  }, [apiService]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.resetFields();
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const updatedUser = { ...user, ...values };
      try {
        await apiService.put(`/users/${id}`, updatedUser);
      } catch (error) {
        if (error instanceof SyntaxError) {
          console.warn("Received 204 No Content, treating as successful.");
        } else {
          throw error;
        }
      }
      setUser(updatedUser);
      alert("Saved!");
      setIsEditing(false);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        alert("Invalid update. Please try again.");
      }
    }
  };

  return (
    // <Authenticator>
    <div style={{ maxWidth: "400px", margin: "auto", padding: "20px", background: "#333", color: "#fff", borderRadius: "8px" }}>
      <h2>User Profile</h2>

      {/* Profile Form */}
      {/* {!user && ( // only for test */}
      {user && (
        <>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
            initialValues={user} // only for test
            style={{ marginTop: "20px" }}
          >
            <Form.Item label="Avatar" shouldUpdate>
              {() => (isEditing ? (
                <div style={{ display: "flex", gap: "10px" }}>
                  {avatar.map((url) => {
                    const selected = form.getFieldValue("avatar") === url;
                    return (
                      <div
                        key={url}
                        onClick={() => {
                          form.setFieldsValue({ avatar: url });
                        }}
                        style={{
                          border: selected ? "2px solid #1890ff" : "2px solid transparent",
                          borderRadius: "50%",
                          cursor: "pointer",
                          transition: "transform 0.2s, border 0.2s",
                          transform: selected ? "scale(1.2)" : "scale(1)", 
                          width: 48,
                          height: 48,
                          boxSizing: "border-box",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <img src={url} alt="avatar" style={{ width: 48, height: 48, borderRadius: "50%" }} />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <img
                  src={form.getFieldValue("avatar") || "/avatar_1.png"} // only for show
                  alt="avatar"
                  style={{ width: 48, height: 48, borderRadius: "50%", display: "block" }}
                />
              ))}
            </Form.Item>
            <Form.Item label="Username" name="username" required={false} rules={[{ required: true, message: "Username cannot be empty!" }, { whitespace: true, message: "Username cannot be just spaces!" },]}>
              <Input disabled={!isEditing} placeholder="Not Set" />
            </Form.Item>
            <Form.Item label="Email" name="email" rules={[{ type: "email", message: "Enter a valid email" }]}>
              <Input disabled={!isEditing} placeholder="example: ex@example.com" />
            </Form.Item>
            <Form.Item label="Bio" name="bio">
              <Input.TextArea rows={2} disabled={!isEditing} placeholder="example: I can guess countries over the world!" />
            </Form.Item>
          </Form>
          <br />
          {user.token === token ? (
          // {!user ? ( // only for test
            !isEditing ? (
              <>
                <Button type="primary" onClick={handleEdit} style={{ marginRight: '20px' }}>
                  Edit
                </Button>
              </>
            ) : (
              <>
                <Button type="primary" onClick={handleSave} style={{ marginRight: '20px' }}>
                  Save
                </Button>
                <Button type="primary" onClick={handleCancel} style={{ marginRight: '20px' }}>
                  Cancel
                </Button>
              </>
            )
          ) : (
            <></>
          )}
        </>
      )}
    </div>
    // </Authenticator>
  );
};

export default ProfilePage;
