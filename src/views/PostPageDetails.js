import React, { useEffect, useState } from "react";
import { Button, ButtonGroup, Card, Col, Container, Image, ListGroup, ListGroupItem, Nav, Navbar, Row } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db, storage } from "../firebase";
import { signOut } from "firebase/auth";
import { deleteDoc, doc, getDoc, collection, getDocs, where, query, updateDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function PostPageDetails() {
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState("");
  const [imageName, setImageName] = useState("");
  const [comments, setComments] = useState([]);
  const [commentStatus, setCommentStatus] = useState([]);
  const [likeStatus, setLikeStatus] = useState(false);
  const [likeCounter, setLikeCounter] =useState(0);
  const [userId, setUserId] = useState("")
  const [reviewId, setReviewId] = useState("");
  const params = useParams();
  const id = params.id;
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  async function deletePost(id) {
    const deleteRef = ref(storage, `image/${imageName}`);
    deleteObject(deleteRef)
      .then(() => {
        console.log("image has been deleted from the firebase storage");
      })
      .catch((error) => {
        console.error(error.message);
      });

    await deleteDoc(doc(db, "posts", id)); //delete this post from the db called posts
    navigate("/");
  }

  async function getPost(id) {
    const postDocument = await getDoc(doc(db, "posts", id)); //get this post from the db called posts
    const post = postDocument.data();
    let uId = ""
    setCaption(post.caption);
    setImage(post.image);
    setImageName(post.imageName);
    setComments(post.comments);
    setLikeCounter(post.likes);

    for(let i = 0; i < post.comments.length; i++){
      let status = commentStatus;
      status.push(false);
    }

    const userEmail = auth.currentUser.email;
    const q =  await getDocs(query(collection(db, "users"), where("email", "==", userEmail)));
    
    //const postReview = await getDocs(collection(db, "users", id, "reviews"));   
    q.forEach((doc) =>{
      setUserId(doc.id);
      uId=doc.id;
    })
    const postReview = await getDocs(collection(db, "users", uId, "reviews"));
    postReview.forEach((doc) => {
      let d = doc.data()
      if(d.postId === id){
        setReviewId(doc.id);
        setLikeStatus(d.like);
      }
    })
    
  }

  const handleLike = async (e) => {
    let counter = likeCounter;    
    
      if(likeStatus){
        counter -= 1;
      } else {
        counter +=1;
      }
    
    if(counter === 0 || counter > 0){
      setLikeCounter(counter);
      await updateDoc(doc(db, "posts", id), { likes: counter});
    }
    console.log(!likeStatus)
    await updateDoc(doc(db, "users", userId, "reviews", reviewId ), { like: !likeStatus  });

  }

  const updateComment = async(index) => { 

  }

  const handleDeleteComment = async(index) => {
  let newComments = comments;

  newComments.splice(index, 1);

  await updateDoc(doc(db, "posts", id), {comments: newComments});
  getPost(id);
  }

  useEffect(() => {
    if (loading) return;
    if (!user) navigate("/login");
    getPost(id);
  }, [id, navigate, user, loading]);

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
        <Row style={{ marginTop: "2rem" }}>
          <Col md="6">
            <Image thumbnail src={image} style={{ width: "100%" }} />
          </Col>
          <Col>
            <Card>
              <Card.Body>
                <Card.Text>{caption}</Card.Text>
                <FontAwesomeIcon
                  icon={
                    likeStatus
                      ? "fa-solid fa-thumbs-up"
                      : "fa-regular fa-thumbs-up"
                  }
                  size="lg"
                  onClick={(e) => {
                    setLikeStatus(!likeStatus);
                    handleLike(e)
                  }}
                  style={{ cursor: "pointer", paddingRight: "16px", color:"blue" }}
                />
                <Card.Link href={`/update/${id}`}>Edit</Card.Link>
                <Card.Link 
                  onClick={() => deletePost(id)}
                  style={{ cursor: "pointer" }}
                >
                  Delete
                </Card.Link>
                <ListGroup style={{paddingTop: '10px'}}>
                  {comments.map((comment, index) => (
                    <ListGroupItem key={index}>
                      {commentStatus[index]? <p>{comment}</p> : <input />}
                      <ButtonGroup>
                      <Button onClick={()=> updateComment(index)}>Edit</Button>
                      <Button onClick={() => {handleDeleteComment(index)}}>Delete</Button>
                      </ButtonGroup>
                    </ListGroupItem>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}
