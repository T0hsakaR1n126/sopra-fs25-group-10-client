"use client";

import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import Link from "next/link";
import { useRouter } from "next/navigation"; // use NextJS router for navigation
import { Layout, Row, Col, Form, Input } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import Image from "next/image";
import { useDispatch } from "react-redux"; // Import useDispatch
import { login } from "@/userSlice";  // Import login action from your userSlice
import { clearGameState } from "@/gameSlice";
import { motion } from "framer-motion";
import { showErrorToast } from "@/utils/showErrorToast";
import { showSuccessToast } from "@/utils/showSuccessToast";

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

      if (response.token && response.userId) {
        // Dispatch login action to Redux store without localStorage
        dispatch(login({
          username: response.username ?? "",
          status: response.status ?? "",
          userId: response.userId.toString(),
          token: response.token,
          avatar: response.avatar ?? "",
          level: Number(response.level) ?? 0,
        }));
        dispatch(clearGameState()); // Clear game state on login

        // Navigate to the user overview
        showSuccessToast("Logged In!");
        router.push("/game");
      }

    } catch (error: unknown) {
      let message = "Something went wrong during login.";
    
      if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as { response?: { data?: { message?: string } } };
        if (err.response?.data?.message) {
          message = err.response.data.message;
        }
      } else if (error instanceof Error) {
        message = error.message;
      }
    
      showErrorToast(message);
    }
  };

  return (
    <Content style={{ minHeight: "100vh", padding: "50px", position: "relative" }}>
      <div
        style={{
          position: "absolute",
          top: "100px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
        }}
      >
        <Image
          src="/mapmaster-logo.png"
          alt="MapMaster Logo"
          width={300}
          height={250}
        />
      </div>

      <Row justify="center" align="middle" style={{ textAlign: "center", marginTop: "320px" }}>
        <Col xs={24} md={16} lg={10}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="login-container">
              <Form
                form={form}
                name="login"
                size="large"
                onFinish={handleLogin}
                layout="vertical"
                validateTrigger="onChange"
              >
                <Form.Item
                  name="username"
                  label="username"
                  rules={[{ required: true, message: "Please input your username!" }]}
                  style={{ marginBottom: 24 }}
                >
                  <Input placeholder="Enter username" prefix={<UserOutlined />} />
                </Form.Item>
                <Form.Item
                  name="password"
                  label="password"
                  rules={[{ required: true, message: "Please input your password!" }]}
                  style={{ marginBottom: 24 }}
                >
                  <Input.Password placeholder="Enter password" visibilityToggle={true} prefix={<LockOutlined />} />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0 }}>
                  <button type="submit" className="login-button">
                    Login
                  </button>
                </Form.Item>
              </Form>
            </div>
            <p
              style={{
                marginTop: 20,
                textAlign: "center",
                fontSize: 14,
                color: "#bbb",
              }}
            >
              Don&apos;t have an account yet?{" "}
              <Link href="/users/register" className="login-link">
                Register here
              </Link>
            </p>
          </motion.div>
        </Col>
      </Row>
    </Content>
  );
};

export default Login;
