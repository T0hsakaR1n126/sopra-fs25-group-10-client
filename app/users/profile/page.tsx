"use client";
import { useState } from "react";
import { Input, Button, Upload, message, Form, Avatar } from "antd";
import { UserOutlined, UploadOutlined } from "@ant-design/icons";

const ProfilePage = () => {
  const [form] = Form.useForm();
  const [user, setUser] = useState({
    username: "Player1",
    email: "player1@example.com",
    bio: "I love geography games!",
    avatar: "/default-avatar.png",
  });

  const handleSave = async (values: any) => {
    // Mock API Call to check unique username
    if (values.username === "takenUsername") {
      message.error("Username is already taken. Please choose another.");
      return;
    }

    // Mock API Call to update user profile
    setTimeout(() => {
      setUser({ ...user, ...values });
      message.success("Profile updated successfully!");
    }, 1000);
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", padding: "20px", background: "#333", color: "#fff", borderRadius: "8px" }}>
      <h2>User Profile</h2>
      
      {/* Profile Picture Upload */}
      <Avatar size={100} src={user.avatar} icon={<UserOutlined />} />
      <Upload showUploadList={false} beforeUpload={() => false}>
        <Button icon={<UploadOutlined />} style={{ marginTop: "10px" }}>Change Avatar</Button>
      </Upload>

      {/* Profile Form */}
      <Form form={form} layout="vertical" initialValues={user} onFinish={handleSave} style={{ marginTop: "20px" }}>
        <Form.Item label="Username" name="username" rules={[{ required: true, message: "Username cannot be empty" }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Email" name="email" rules={[{ type: "email", message: "Enter a valid email" }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Bio" name="bio">
          <Input.TextArea rows={2} />
        </Form.Item>

        <Button type="primary" htmlType="submit">Save Changes</Button>
      </Form>
    </div>
  );
};

export default ProfilePage;
