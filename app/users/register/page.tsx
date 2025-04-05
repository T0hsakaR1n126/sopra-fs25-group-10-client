"use client";

import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import { Layout, Row, Col, Form, Input, Button } from "antd";
import Image from 'next/image';
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDispatch } from "react-redux"; // Import useDispatch
import { login } from "@/userSlice"; // Import login action from your userSlice

const { Content } = Layout;

interface FormFieldProps {
  label: string;
  value: string;
}

const Register: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();
  const dispatch = useDispatch(); // Set up dispatch for Redux actions

  const handleRegister = async (values: FormFieldProps) => {
    try {
      // Call the API service and let it handle JSON serialization and error handling
      const response = await apiService.post<User>("/register", values);

      // Navigate to the user overview (or wherever the user should go after registration)
      alert("Registration successful! You can now log in.");
      router.push("/users/login");
      
    } catch (error) {
      if (error instanceof Error) {
        alert(`Something went wrong during registration:\n${error.message}`);
      } else {
        console.error("An unknown error occurred during registration.");
      }
    }
  };

  return (
    <Content style={{ minHeight: "100vh", padding: "50px" }}>
      <Row justify="center" align="middle" style={{ textAlign: "center" }}>
        <Col xs={24} md={16}>
          <Image
            src="/mapmaster-logo.png"
            alt="MapMaster Logo"
            width={350}
            height={300}
          />
          <div className="login-container">
            <Form
              form={form}
              name="register"
              size="large"
              onFinish={handleRegister}
              layout="vertical"
            >
              <Form.Item
                name="username"
                label="Username"
                rules={[{ required: true, message: "Please input your username!" }]}
              >
                <Input placeholder="Enter username" />
              </Form.Item>

              <Form.Item
                name="name"
                label="Name"
                rules={[{ required: true, message: "Please input your name!" }]}
              >
                <Input placeholder="Enter name" />
              </Form.Item>

              <Form.Item
                name="password"
                label="Password"
                rules={[{ required: true, message: "Please input your password!" }]}
              >
                <Input.Password placeholder="Enter password" visibilityToggle={true} />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" className="login-button">
                  Register
                </Button>
              </Form.Item>
            </Form>
          </div>

          <p>
            Already have an account?{" "}
            <Link href="/users/login" className="login-link">
              Log in here
            </Link>
          </p>
        </Col>
      </Row>
    </Content>
  );
};

export default Register;
