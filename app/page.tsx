"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Layout, Row, Col } from "antd";

const { Content } = Layout;

const HomePage = () => {
  const router = useRouter();
  const [startAnimation, setStartAnimation] = useState(false);
  const [redirectReady, setRedirectReady] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => setStartAnimation(true), 300);
    const redirectTimer = setTimeout(() => setRedirectReady(true), 1000);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(redirectTimer);
    };
  }, []);

  useEffect(() => {
    if (redirectReady) {
      router.push("/users/login");
    }
  }, [redirectReady]);

  return (
    <Content style={{ height: "100vh", padding: "50px", position: "relative", overflow: "hidden" }}>
      <Row justify="center">
        <Col>
          {startAnimation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 0 }}
              animate={{ opacity: 1, scale: 1, y: 50 }}
              transition={{ duration: 0.6 }}
              style={{
                position: "relative",
                zIndex: 10,
              }}
            >
              <Image
                src="/mapmaster-logo.png"
                alt="MapMaster Logo"
                width={300}
                height={250}
              />
            </motion.div>
          )}
        </Col>
      </Row>
    </Content>
  );
};

export default HomePage;
