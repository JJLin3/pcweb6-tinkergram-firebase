import React, { useEffect, useState } from "react";
import { Button, Container, Form, Nav, Navbar, Image } from "react-bootstrap";
import { addDoc, collection } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { auth, db, storage } from "../firebase";
import { signOut } from "firebase/auth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

export default function PostPageAdd() {
  //auth is credential, return user which is a boolean value on whether the user is authenticate and loading during authentication
  const [caption, setCaption] = useState("");
  const [user, loading] = useAuthState(auth);
  const [image, setImage] = useState("");
  const [imageName, setImageName] = useState("");
  const [previewImage, setPreviewImage] = useState("https://zca.sg/img/placeholder");
  const navigate = useNavigate();

  async function addPost() {
    //Reserve a spot in Firebase Storage for I'm about to upload.This spot should be in the images folder, and the file name will be image.name
    const imageReference = ref(storage, `image/${image.name}`);

    //Upload the file to the spot I just reserved in Firebase Storage
    const response = await uploadBytes(imageReference, image);

    //Get me a URL for the file I just uploaded so I can access this from anywhere
    const imageUrl = await getDownloadURL(response.ref); 

    //Add the document to Cloud Firestore
    await addDoc(collection(db, "posts"), { caption, image: imageUrl, imageName: imageName }); //add an entry/document whcih contain a caption and an image to the collection
    navigate("/");
  }

  //We want to make sure the LOGGED IN user can add a post
  useEffect(() => {
    if (loading) return;
    if (!user) return navigate("/login"); //user isn't login, redirect user to login page
  }, [loading, user, navigate]);

  return (
    <>
      <Navbar variant="light" bg="light">
        <Container>
          <Navbar.Brand href="/">Tinkergram</Navbar.Brand>
          <Nav>
            <Nav.Link href="/add">New Post</Nav.Link>
            <Nav.Link onClick={() => signOut(auth)}>🚪</Nav.Link>
          </Nav>
        </Container>
      </Navbar>
      <Container>
        <h1 style={{ marginBlock: "1rem" }}>Add Post</h1>
        <Form>
          <Form.Group className="mb-3" controlId="caption">
            <Form.Label>Caption</Form.Label>
            <Form.Control
              type="text"
              placeholder="Lovely day"
              value={caption}
              onChange={(text) => setCaption(text.target.value)}
            />
          </Form.Group>
          <Image
          src={previewImage}
          style={{
            objectFit: "cover",
            width: "10rem",
            height: "10rem"
          }}
          />
          <Form.Group className="mb-3" controlId="image">
            <Form.Label>Image</Form.Label>
            <Form.Control
              type="file"
              onChange={(e) => {
                if(e.target.files.length < 1) return;
                const imageFile = e.target.files[0];
                const previewImage = URL.createObjectURL(imageFile);
                setImage(imageFile);
                setPreviewImage(previewImage);
                setImageName(imageFile.name);
              }}
            />
          </Form.Group>
          <Button variant="primary" onClick={async (e) => addPost()}>
            Submit
          </Button>
        </Form>
      </Container>
    </>
  );
}
