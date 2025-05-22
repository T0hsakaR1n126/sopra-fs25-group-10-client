"use client";
import { useEffect, useState } from "react";
import { Input, Button, Form, Drawer, message } from "antd";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { updateUserInfo } from "@/userSlice";
import styles from "@/styles/profile.module.css";
import { showSuccessToast } from "@/utils/showSuccessToast";
import { showErrorToast } from "@/utils/showErrorToast";

const ProfilePage = () => {
  const router = useRouter();
  const params = useParams();
  const apiService = useApi();
  const dispatch = useDispatch();
  const userId = useSelector((state: { user: { userId: string } }) => state.user.userId);
  const token = useSelector((state: { user: { token: string } }) => state.user.token);
  const viewedUserId = (!params.id || params.id === "none") ? userId : params.id as string;
  const [form] = Form.useForm();
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const avatar = [
    "/avatar_1.png", "/avatar_2.png", "/avatar_3.png",
    "/avatar_4.png", "/avatar_5.png", "/avatar_6.png"
  ];
  const currentAvatar = Form.useWatch("avatar", form);

  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => { }, [params]);

  // animation
  const [isLeaving, setIsLeaving] = useState(false);
  useEffect(() => {
    const handleExit = () => {
      if (!isLeaving) setIsLeaving(true);
    };

    window.addEventListener("otherExit", handleExit);
    return () => window.removeEventListener("otherExit", handleExit);
  }, [isLeaving]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response: User = await apiService.get<User>(`/users/${viewedUserId}`);
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
  }, [apiService, viewedUserId, router]);

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => { setIsEditing(false); form.resetFields(); };
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const updatedUser = { ...user, ...values };
      try {
        await apiService.put(`/users/${userId}`, updatedUser);
      } catch (error) {
        if (!(error instanceof SyntaxError)) throw error;
      }
      setUser(updatedUser);
      dispatch(updateUserInfo({
        username: updatedUser.username ?? "",
        avatar: updatedUser.avatar ?? "",
        level: Number(updatedUser.level) / 100,
      }));
      setIsEditing(false);
      showSuccessToast("Saved!");
    } catch (error) {
      if (error instanceof Error) {
        showErrorToast(error.message);
      }
    }
  };

  const handleChangePassword = async (values: { userId: string, newPassword: string }) => {
    try {
      await apiService.put(`/users/pwd`, {
        userId: userId,
        password: values.newPassword,
      });
      showSuccessToast("Password changed successfully!");
      setDrawerOpen(false);
    } catch (err) {
      if (err instanceof Error) {
        showErrorToast(err.message);
      }
    }
  };

  return (
    <div className={`${styles.container} ${isLeaving ? styles.pageExit : styles.pageEnter}`}>
      <div className={`${styles.card} ${drawerOpen ? styles.shifted : ""}`}>
        <h2 className={styles.title}>User Profile</h2>
        {user && (
          <>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
              initialValues={user}
              style={{ marginTop: "20px", width: "100%" }}
            >
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <Form.Item>
                  <Form.Item name="avatar" noStyle>
                    {isEditing ? (
                      <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
                        {avatar.map((url) => {
                          const selected = currentAvatar === url;
                          return (
                            <div
                              key={url}
                              onClick={() => form.setFieldsValue({ avatar: url })}
                              style={{
                                border: selected ? "2px solid #0ea5e9" : "2px solid rgba(255,255,255,0.1)",
                                boxShadow: selected ? "0 0 8px #0ea5e9" : "none",
                                borderRadius: "50%",
                                cursor: "pointer",
                                transition: "transform 0.2s, border 0.2s",
                                transform: selected ? "scale(1.2)" : "scale(1)",
                                width: 64,
                                height: 64,
                                boxSizing: "border-box",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <img src={url} alt="avatar" className={styles.avatarImg} />
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ display: "flex", justifyContent: "center" }}>
                        <img src={form.getFieldValue("avatar")} alt="avatar" className={styles.avatarImg} />
                      </div>
                    )}
                  </Form.Item>
                </Form.Item>
              </div>

              <Form.Item label="Username">
                {isEditing ? (
                  <Form.Item name="username" noStyle rules={[{ required: true, message: "Username cannot be empty!" }, { whitespace: true, message: "Username cannot be just spaces!" }]}>
                    <Input className={styles.customInput} placeholder="Not Set" />
                  </Form.Item>
                ) : (
                  <div className={styles.readOnlyBox}>{form.getFieldValue("username") || "Not Set"}</div>
                )}
              </Form.Item>

              {/* {isEditing && (
                <Form.Item label="Password">
                  <Form.Item name="password" noStyle>
                    <Input.Password className={styles.customInput} placeholder="input your new password" visibilityToggle />
                  </Form.Item>
                </Form.Item>
              )} */}

              <Form.Item label="Email">
                {isEditing ? (
                  <Form.Item name="email" noStyle>
                    <Input className={styles.customInput} placeholder="example: ex@example.com" />
                  </Form.Item>
                ) : (
                  <div className={styles.readOnlyBox}>{form.getFieldValue("email") || "Not Set"}</div>
                )}
              </Form.Item>

              <Form.Item label="Bio">
                {isEditing ? (
                  <Form.Item name="bio" noStyle>
                    <Input.TextArea className={styles.customInput} rows={2} placeholder="example: I can guess countries over the world!" />
                  </Form.Item>
                ) : (
                  <div className={styles.readOnlyBox}>{form.getFieldValue("bio") || "Not Set"}</div>
                )}
              </Form.Item>
            </Form>

            <br />
            {user.token === token && (
              !isEditing ? (
                <div className={styles.buttonGroup}>
                  <button className={styles.neonButton} onClick={handleEdit}>Edit</button>
                  <button
                    className={styles.neonButton}
                    onClick={() => setDrawerOpen(true)}
                    disabled={drawerOpen}
                  >
                    Change Password
                  </button>
                </div>
              ) : (
                <div className={styles.buttonGroup}>
                  <button className={styles.neonButtonFilled} onClick={handleSave}>Save</button>
                  <button className={styles.neonButton} onClick={handleCancel}>Cancel</button>
                </div>
              )
            )}
          </>
        )}
      </div>
      {drawerOpen &&
        <div className={styles.passwordPopup}>
          <h3>Change Password</h3>
          <Form layout="vertical" onFinish={handleChangePassword}>
            <Form.Item label="New Password" name="newPassword" rules={[{ required: true }]}>
              <Input.Password className={styles.customInput} />
            </Form.Item>
            <Form.Item label="Confirm Password" name="confirmPassword" dependencies={["newPassword"]} rules={[
              { required: true },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) return Promise.resolve();
                  return Promise.reject(new Error("Passwords do not match!"));
                },
              }),
            ]}>
              <Input.Password className={styles.customInput} />
            </Form.Item>
            <Form.Item>
              <div className={styles.buttonGroup}>
                <button className={styles.neonButtonFilled} type="submit">Update</button>
                <button onClick={() => setDrawerOpen(false)} className={styles.neonButton}>Cancel</button>
              </div>
            </Form.Item>
          </Form>
        </div>
      }
    </div>
  );
};

export default ProfilePage;