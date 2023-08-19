import React, { useState } from "react";
import { Button, Container, Form } from "react-bootstrap";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider } from "../firebase";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const signInWithGoogle = async() => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (error){
      console.error(error);
    }
  }
  return (
    <Container>
      <h1 className="my-3">Login to your account</h1>
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
          <a href="/signup">Sign up for an account</a>
        </Form.Group>
        <Button
        variant="primary"
        onClick={async (e) => {
          setError("");
          const canLogin = username && password;
          if(canLogin){
            try{
              await signInWithEmailAndPassword(auth, username, password);
              navigate("/");
            } catch (error) {
              setError(error.message);
            }
          } else {
            setError("Please fill in all the fields.")
          }
        }}
        >
          Login
        </Button>
      </Form>
      <p>{error}</p>
      <Button onClick={signInWithGoogle}> Signin with google</Button>
    </Container>
  );
}
