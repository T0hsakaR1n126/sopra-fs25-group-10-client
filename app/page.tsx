"use client";

import { Button, Col, Layout, Row, Typography } from "antd";
import Image from 'next/image';
import { useRouter } from "next/navigation";
import React from "react";

const { Content } = Layout;
const { Text } = Typography;

const HomePage = () => {
  const router = useRouter();

  return (
    <Content style={{ minHeight: "100vh", padding: "50px" }}>
      <Row justify="center" align="middle" style={{ textAlign: "center" }}>
        <Col xs={24} md={16}>
          {/* Logo */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0px' }}>
            <Image
              src="/mapmaster-logo.png"
              alt="MapMaster Logo"
              width={350}
              height={300}
            />
          </div>

          {/* Description */}
          <Text style={{ color: "#bbb", fontSize: "18px", marginBottom: "20px", display: "block" }}>
            Your ultimate map-based challenge game! Start playing now and test your geography skills.
          </Text>

          {/* Rules Section */}
          <div style={{ color: '#fff', fontSize: '1rem', textAlign: 'center', marginBottom: "30px" }}>
            <Title level={4} style={{ color: '#fff', textDecoration: 'underline' }}>Rules</Title>

            {/* Remove list bullets */}
            <ol style={{ listStyleType: "none", paddingLeft: 0 }}>
              <li style={{ marginBottom: "20px" }}>
                <Title level={5} style={{ color: '#fff' }}>Game Modes</Title>
                <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
                  <li>
                    <Text strong>Solo Mode:</Text> Practice and simulate the game.
                  </li>
                  <li>
                    <Text strong>Combat Mode:</Text>  Battles for multiple players.
                  </li>
                </ul>
              </li>

              <li>
                <Title level={5} style={{ color: '#fff' }}>Scoring System</Title>
                <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
                  <li>Each game starts with <Text strong>100 points</Text>.</li>
                  <li>Using a hint deducts <Text strong>20 points</Text>.</li>
                  <li>5 hints max—using all results in <Text strong>0 points</Text>.</li>
                  <li>Closer guesses earn <Text strong>bonus points</Text>.</li>
                </ul>
              </li>
            </ol>
          </div>

          {/* Play Button */}
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <Button type="primary" size="large" shape="circle" onClick={() => router.push("/users/login")}>
              <Image src="/play-button.png" alt="Play" width={30} height={30} />
            </Button>
            <Text style={{ color: '#fff', marginTop: '10px', display: 'block' }}>
              Let&apos;s play
              <span className="dots">.</span>
            </Text>

            <style jsx>{`
  @keyframes dots {
    0% { content: "."; }
    33% { content: ".."; }
    66% { content: "..."; }
  }
      
  .dots::after {
    content: "...";
    animation: dots 1.5s infinite steps(3);
  }
`}</style>
          </div>
        </Col>
      </Row>
    </Content>
  );
};

export default HomePage;
