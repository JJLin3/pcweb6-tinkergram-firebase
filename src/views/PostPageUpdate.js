import React, { useEffect, useState } from "react";
import { Button, Container, Form, Nav, Navbar, Image } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db, storage } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { getDownloadURL, ref, uploadBytes, deleteObject } from "firebase/storage";

export default function PostPageUpdate() {
  const params = useParams();
  const id = params.id;
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState("");
  const [imageName, setImageName] = useState("");
  const [previewImage, setPreviewImage] = useState(
    "https://zca.sg/img/placeholder"
  );
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  async function updatePost() {
    let imageUrl = previewImage;

    if (image) {
      const deleteRef = ref(storage, `image/${imageName}`);
      await deleteObject(deleteRef);
      console.log("old image has been deleted from gcs!");
      //Reserve a spot in Firebase Storage for I'm about to upload.This spot should be in the images folder, and the file name will be image.name
      const imageReference = ref(storage, `image/${image.name}`);

      //Upload the file to the spot I just reserved in Firebase Storage
      const response = await uploadBytes(imageReference, image);

      //Get me a URL for the file I just uploaded so I can access this from anywhere
      imageUrl = await getDownloadURL(response.ref);

      //Add the document to Cloud Firestore
      await updateDoc(doc(db, "posts", id), { caption, image: imageUrl, imageName: image.name });
    } else {
      //Add the document to Cloud Firestore if no image is uploaded
      await updateDoc(doc(db, "posts", id), { caption });
    }

    
    navigate("/");
  }

  async function getPost(id) {
    //const images = storage.ref().child('companyImages');
  //const image = images.child('image1');
  //image.getDownloadURL().then((url) => { console.log(url)});
    const postDocument = await getDoc(doc(db, "posts", id));
    const post = postDocument.data();
    setCaption(post.caption);
    setPreviewImage(post.image);
    setImageName(post.imageName);
  }

  useEffect(() => {
    if (loading) return;
    if (!user) return navigate("/login");
    getPost(id);
  }, [id, loading, user, navigate]);

  return (
    <div>
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
        <h1 style={{ marginBlock: "1rem" }}>Update Post</h1>
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
              height: "10rem",
            }}
          />

          <Form.Group className="mb-3" controlId="image">
            <Form.Label>Image</Form.Label>
            <Form.Control
              type="file"
              onChange={(e) => {
                if (e.target.files.length < 1) {
                  getPost(id);
                  setImage("");
                  return;
                }
                const imageFile = e.target.files[0];
                const previewImage = URL.createObjectURL(imageFile);
                setImage(imageFile);
                setPreviewImage(previewImage);
              }}
            />
          </Form.Group>
          <Button variant="primary" onClick={(e) => updatePost()}>
            Submit
          </Button>
        </Form>
      </Container>
    </div>
  );
}
