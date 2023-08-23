import React, { useState } from "react";
import { Button, Container, Form } from "react-bootstrap";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { addDoc, collection } from "firebase/firestore";

export default function SignUpPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async () => {
    const canSignUp = username && password;
    if (canSignUp) {
      try {
        await createUserWithEmailAndPassword(auth, username, password);
        await addDoc(collection(db, "users"), {email: username, likes: []})
        navigate("/");
      } catch (error) {
        setError(error.message);
      }
    } else {
      setError("Please fill in all the fields.");
    }
  };

  return (
    <Container>
      <h1 className="my-3">Sign up for an account</h1>
      <Form>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Form.Text className="text-muted">
            We'll never share your email with anyone else.
          </Form.Text>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <a href="/login">Have an existing account? Login here.</a>
        </Form.Group>
        <Button
          variant="primary"
          onClick={async (e) => {
            handleSignUp(e);
          }}
        >
          Sign Up
        </Button>
      </Form>
      <p>{error}</p>
    </Container>
  );
}
