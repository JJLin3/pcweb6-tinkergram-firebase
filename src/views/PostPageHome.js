import { useEffect, useState } from "react";
import { Container, Image, Nav, Navbar, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function PostPageHome() {
  const [posts, setPosts] = useState([]);
  const [user] = useAuthState(auth);

  async function getAllPosts() {
    const query = await getDocs(collection(db, "posts")); //retrieve data from collection posts
    const posts = query.docs.map((doc) => {
      return { id: doc.id, ...doc.data() }; // set id with the auto-id and then the image and caption
    });
    setPosts(posts);
  }

  useEffect(() => {
    getAllPosts();
  }, []);

  const ImagesRow = () => {
    const newPosts = posts.sort((a, b) => {
      if (b.likes < a.likes) {
        return -1;
      }
    
      if (b.likes > a.likes) {
        return 1;
      }
    
      return 0;
    });
    return newPosts.map((post, index) => <ImageSquare key={index} post={post} />);
  };

  return (
    <>
      <Navbar variant="light" bg="light">
        <Container>
          <Navbar.Brand href="/">Tinkergram</Navbar.Brand>
          <Nav>
            <Nav.Link href="/add">New Post</Nav.Link>
            {user && <Nav.Link onClick={() => signOut(auth)}>🚪</Nav.Link>}
          </Nav>
        </Container>
      </Navbar>
      <Container>
        <Row>
          <ImagesRow />
        </Row>
      </Container>
    </>
  );
}

function ImageSquare({ post }) {
  const { image, id ,likes } = post;
  return (
    <Link
      to={`post/${id}`}
      style={{
        width: "18rem",
        marginLeft: "1rem",
        marginTop: "2rem",
      }}
    >
      <Image
        src={image}
        style={{
          objectFit: "cover",
          width: "18rem",
          height: "18rem",
        }}
        thumbnail
      />
      {likes > 0 ? <>{likes}<FontAwesomeIcon icon="fa-solid fa-thumbs-up" size="lg" style={{paddingLeft:'10px'}}/></>: ""}
    </Link>
  );
}
