"use client";
import { useEffect, useState } from "react";
import { Input, Button, Form, Typography } from "antd";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user"
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
// import Authenticator from "@/auth/authenticator";

const ProfilePage = () => {
  const router = useRouter();
  const apiService = useApi();
  const userId = useSelector((state: { user: { userId: string } }) => state.user.userId);
  const token = useSelector((state: { user: { token: string } }) => state.user.token);

  const [form] = Form.useForm();
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const avatar = ["/avatar_1.png", "/avatar_2.png", "/avatar_3.png", "/avatar_4.png", "/avatar_5.png", "/avatar_6.png"];
  const currentAvatar = Form.useWatch("avatar", form);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response: User = await apiService.get<User>(`/users/${userId}`);
        setUser(response);
      } catch (error) {
        if (error instanceof Error) {
          alert(`Something went wrong while fetching user:\n${error.message}`);
          router.push("/game");
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
        await apiService.put(`/users/${userId}`, updatedUser);
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
    <div style={{ minHeight: "100vh", paddingTop: "80px", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "500px", maxWidth: "90vw", height: "auto", margin: "auto", padding: "20px", background: "#333", color: "#fff", borderRadius: "8px" }}>
        {/* Profile Form */}
        {/* {!user && ( // only for test */}
        {user && (
          <>
            <h2 style={{ textAlign: "center" }}>User Profile</h2>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
              initialValues={user} // only for test
              style={{ marginTop: "20px", color: "#fff" }}
            >
              <Form.Item label="Avatar">
                <Form.Item name="avatar" noStyle>
                  {isEditing ? (
                    <div style={{ display: "flex", gap: "10px" }}>
                      {avatar.map((url) => {
                        const selected = currentAvatar === url;
                        return (
                          <div
                            key={url}
                            onClick={() => form.setFieldsValue({ avatar: url })}
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
                      src={form.getFieldValue("avatar")}
                      alt="avatar"
                      style={{ width: 48, height: 48, borderRadius: "50%", display: "block" }}
                    />
                  )}
                </Form.Item>
              </Form.Item>

              <Form.Item label="Username">
                {isEditing ? (
                  <Form.Item name="username" noStyle rules={[
                    { required: true, message: "Username cannot be empty!" },
                    { whitespace: true, message: "Username cannot be just spaces!" },
                  ]}>
                    <Input placeholder="Not Set" />
                  </Form.Item>
                ) : (
                  <div
                    style={{
                      padding: "6px 11px",
                      minHeight: 32,
                      border: "1px solid #666",
                      borderRadius: 6,
                      color: form.getFieldValue("username") ? "#fff" : "#888",
                      backgroundColor: "#444",
                    }}
                  >
                    {form.getFieldValue("username") || "Not Set"}
                  </div>
                )}
              </Form.Item>
              <Form.Item label="Name">
                {isEditing ? (
                  <Form.Item name="name" noStyle rules={[
                    { required: true, message: "Name cannot be empty!" },
                    { whitespace: true, message: "Username cannot be just spaces!" },
                  ]}>
                    <Input placeholder="Not Set" />
                  </Form.Item>
                ) : (
                  <div
                    style={{
                      padding: "6px 11px",
                      minHeight: 32,
                      border: "1px solid #666",
                      borderRadius: 6,
                      color: form.getFieldValue("name") ? "#fff" : "#888",
                      backgroundColor: "#444",
                    }}
                  >
                    {form.getFieldValue("name") || "Not Set"}
                  </div>
                )}
              </Form.Item>
              <Form.Item label="Email">
                {isEditing ? (
                  <Form.Item name="email" noStyle>
                    <Input placeholder="example: ex@example.com" />
                  </Form.Item>
                ) : (
                  <div
                    style={{
                      padding: "6px 11px",
                      minHeight: 32,
                      border: "1px solid #666",
                      borderRadius: 6,
                      color: form.getFieldValue("email") ? "#fff" : "#888",
                      backgroundColor: "#444",
                    }}
                  >
                    {form.getFieldValue("email") || "Not Set"}
                  </div>
                )}
              </Form.Item>
              <Form.Item label="Bio">
                {isEditing ? (
                  <Form.Item name="bio" noStyle>
                    <Input.TextArea
                      rows={2}
                      placeholder="example: I can guess countries over the world!"
                    />
                  </Form.Item>
                ) : (
                  <div
                    style={{
                      minHeight: "64px",
                      padding: "6px 11px",
                      border: "1px solid #666",
                      borderRadius: 6,
                      color: form.getFieldValue("bio") ? "#fff" : "#888",
                      backgroundColor: "#444",
                      whiteSpace: "pre-wrap",
                      lineHeight: 1.5,
                    }}
                  >
                    {form.getFieldValue("bio") || "Not Set"}
                  </div>
                )}
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
    </div>
    // </Authenticator>
  );
};

export default ProfilePage;
