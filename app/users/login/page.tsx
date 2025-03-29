"use client"; // ✅ Mark this as a Client Component

import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import Link from "next/link";
import { useRouter } from "next/navigation"; // use NextJS router for navigation
import { Layout, Row, Col, Form, Input, Button } from "antd";
import Image from "next/image";
import { useDispatch } from "react-redux"; // Import useDispatch
import { login } from "@/userSlice";  // Import login action from your userSlice

const { Content } = Layout;

interface FormFieldProps {
  label: string;
  value: string;
}

const Login: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();
  const dispatch = useDispatch(); // Set up dispatch for Redux actions

  const handleLogin = async (values: FormFieldProps) => {
    try {
      // Call the API service and let it handle JSON serialization and error handling
      const response = await apiService.post<User>("/login", values);
  
      if (response.token && response.id) {
        // Dispatch login action to Redux store without localStorage
        dispatch(login({ 
          username: response.username ?? "",
          status: response.status ?? "", 
          userId: response.id.toString(), 
          token: response.token 
        }));
  
        // Navigate to the user overview
        router.push("/lobby");
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(`Something went wrong during the login:\n${error.message}`);
      } else {
        console.error("An unknown error occurred during login.");
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
              name="login"
              size="large"
              onFinish={handleLogin}
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
                name="password"
                label="Password"
                rules={[{ required: true, message: "Please input your password!" }]}
              >
                <Input.Password placeholder="Enter password" visibilityToggle={true} />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" className="login-button">
                  Login
                </Button>
              </Form.Item>
            </Form>
          </div>
          <p>
            Don&apos;t have an account yet?{" "}
            <Link href="/users/register" className="login-link">
              Register here
            </Link>
          </p>
        </Col>
      </Row>
    </Content>
  );
};

export default Login;
