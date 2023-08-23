import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Container,
  Image,
  ListGroup,
  ListGroupItem,
  Nav,
  Navbar,
  Row,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db, storage } from "../firebase";
import { signOut } from "firebase/auth";
import {
  deleteDoc,
  doc,
  getDoc,
  collection,
  getDocs,
  where,
  query,
  updateDoc,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function PostPageDetails() {
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState("");
  const [imageName, setImageName] = useState("");
  const [comments, setComments] = useState([]);
  const [commentStatus, setCommentStatus] = useState([]);
  const [likeStatus, setLikeStatus] = useState(false);
  const [userLikes, setUserLikes] = useState([]);
  const [likeCounter, setLikeCounter] = useState(0);
  const [userId, setUserId] = useState("");
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

  async function getPost(id, user) {
    const postDocument = await getDoc(doc(db, "posts", id)); //get this post from the db called posts
    const post = postDocument.data();
    setCaption(post.caption);
    setImage(post.image);
    setImageName(post.imageName);
    setComments(post.comments);
    setLikeCounter(post.likes);
    const status = [];

    for (let i = 0; i < post.comments.length; i++) {
      status.push(false);
    }
    setCommentStatus(status);

    if (user) { // if user is login, retrieve the user info from the db whcih contain user email and array of postId which the user like
      const q = await getDocs(
        query(collection(db, "users"), where("email", "==", auth.currentUser.email))
      );

      q.forEach((doc) => {
        const item = doc.data();
        setUserId(doc.id);
        setUserLikes(item.likes);
        if((item.likes === undefined || item.likes.length > 0) && item.likes.includes(id)){
          setLikeStatus(true)
        }
      });
    }
  }


  const handleLike = async (e) => { // toggle and send the like status to the db
    let counter = likeCounter;
    let userLikesArray = userLikes;

    if (likeStatus) {
      counter -= 1;
      userLikesArray.splice(userLikes.indexOf(id), 1)
    } else {
      counter += 1;
      userLikesArray.push(id)
    }

    console.log(userLikesArray + " _ " + userId)

    if (counter === 0 || counter > 0) {
      setLikeCounter(counter);
      await updateDoc(doc(db, "posts", id), { likes: counter });
    }

    await updateDoc(doc(db, "users", userId), {
      likes: userLikesArray
    });
  };

  const toggleComment = async (index) => { //save to db if comment is text 
    let newComments = [...comments];
    let status = [...commentStatus];
    status[index] = !commentStatus[index];
    setCommentStatus(status);

    if(status[index]===false){
      newComments.splice(index, {userid: userId, comment:comments[index] })
      await updateDoc(doc(db, "posts", id), { comments: newComments});
    }
  };

  const handleDeleteComment = async (index) => { // delete comment object from the comments array and the comment array in the db
    let newComments = [...comments];
    let newCommentStatus = [...commentStatus];

    newComments.splice(index, 1);
    newCommentStatus.splice(index, 1);

    setComments(newComments);
    setCommentStatus(newCommentStatus);

    await updateDoc(doc(db, "posts", id), { comments: newComments });
  };

  const handleUpdateComment = async (e, index) => { //change the value in the comment object
    let newComments = [...comments];

    newComments.splice(index, 1, {userId: userId, comment: e.target.value});
    setComments(newComments);
    console.log(newComments)
  };

  const handleAddComment = async () => { // add a new comment object to the comments array
    let newComments = [...comments];
    let newCommentStatus = [...commentStatus];

    newComments.push({userId: userId, comment:""});
    await updateDoc(doc(db, "posts", id), { comments: newComments });
    newCommentStatus.push(false)
    setComments(newComments);
    setCommentStatus(newCommentStatus);
  };

  useEffect(() => {
    if (loading) return;
    if (!user) navigate("/login");
    getPost(id, user, );
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
                    handleLike(e);
                  }}
                  style={{
                    cursor: "pointer",
                    paddingRight: "16px",
                    color: "blue",
                  }}
                />
                <Card.Link href={`/update/${id}`}>Edit</Card.Link>
                <Card.Link
                  onClick={() => deletePost(id)}
                  style={{ cursor: "pointer" }}
                >
                  Delete
                </Card.Link>
                <ListGroup style={{ paddingTop: "10px" }}>
                  {comments.map((item, index) => (
                    <ListGroupItem key={index}>
                      {!commentStatus[index] ? (
                        <p>{item.comment}</p>
                      ) : (
                        <input
                          value={item.comment}
                          onChange={(e) => handleUpdateComment(e, index)}
                        />
                      )}
                        {item.userId === userId ?<><Card.Link  style={{ cursor: "pointer" }} onClick={() => toggleComment(index)}>
                          Edit
                        </Card.Link>
                        <Card.Link
                         style={{ cursor: "pointer" }}
                          onClick={() => {
                            handleDeleteComment(index);
                          }}
                        >
                          Delete
                        </Card.Link></>: ""}
                    </ListGroupItem>
                  ))}
                  <Button
                    className="mt-2"
                    onClick={() => {
                      handleAddComment();
                    }}
                  >
                    Add
                  </Button>
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}
