import React, { useState, useEffect } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import MainNavbar from "../components/MainNavbar";
import userService from "../services/userService";
import { User } from "../types/user";
import { useNavigate } from "react-router-dom";

const UserInfoPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<{
    username: string;
    email: string;
    password?: string;
  }>({ username: "", email: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUser() {
      try {
        const userData = await userService.getCurrentUser();
        setUser(userData);
        setFormData({ username: userData.username, email: userData.email });
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    }
    fetchUser();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      try {
        const updatedUser = await userService.updateUser(user.id, formData);
        setUser(updatedUser);
        setMessage("User information updated successfully.");
        setEditMode(false);
      } catch (error: any) {
        console.error("Error updating user:", error);
        setMessage(error.response?.data?.detail || "Update failed");
      }
    }
  };

  const handleDelete = async () => {
    if (
      user &&
      window.confirm("Are you sure you want to delete your account?")
    ) {
      try {
        await userService.deleteUser(user.id);
        setMessage("Account deleted successfully.");
        // Optionally, clear tokens and redirect to home
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/");
      } catch (error: any) {
        console.error("Error deleting account:", error);
        setMessage(error.response?.data?.detail || "Deletion failed");
      }
    }
  };

  return (
    <>
      <MainNavbar />
      <Container
        fluid
        className="mt-5 py-5 content-padding"
        style={{ maxWidth: "500px" }}
      >
        <h2>User Information</h2>
        {message && <Alert variant="info">{message}</Alert>}
        {user && !editMode ? (
          <div>
            <p>
              <strong>Username:</strong> {user.username}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <Button
              variant="primary"
              onClick={() => setEditMode(true)}
              className="me-2"
            >
              Edit Info
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete Account
            </Button>
          </div>
        ) : (
          <Form onSubmit={handleUpdate}>
            <Form.Group controlId="editUsername" className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group controlId="editEmail" className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group controlId="editPassword" className="mb-3">
              <Form.Label>Password (leave blank to keep current)</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter new password"
                value={formData.password || ""}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="me-2">
              Save
            </Button>
            <Button variant="secondary" onClick={() => setEditMode(false)}>
              Cancel
            </Button>
          </Form>
        )}
      </Container>
    
    </>
  );
};

export default UserInfoPage;
