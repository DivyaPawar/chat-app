import React, { useState, useEffect, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import IconButton from "@material-ui/core/IconButton";
import SendIcon from "@material-ui/icons/Send";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import Paper from "@material-ui/core/Paper";
import socketIOClient from "socket.io-client";
import classnames from "classnames";
import commonUtilites from "../Utilities/common";

import Dropzone from 'react-dropzone';
import {
  useGetGlobalMessages,
  useSendGlobalMessage,
  useGetConversationMessages,
  useSendConversationMessage,
  useSendCoversationImage
} from "../Services/chatService";
import { authenticationService } from "../Services/authenticationService";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
  },
  headerRow: {
    maxHeight: 60,
    zIndex: 5,
  },
  paper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    color: theme.palette.primary.dark,
  },
  messageContainer: {
    height: "100%",
    display: "flex",
    alignContent: "flex-end",
  },
  messagesRow: {
    maxHeight: "calc(100vh - 184px)",
    overflowY: "auto",
  },
  newMessageRow: {
    width: "100%",
    padding: theme.spacing(0, 2, 1),
  },
  messageBubble: {
    padding: 10,
    border: "1px solid white",
    backgroundColor: "white",
    borderRadius: "0 10px 10px 10px",
    boxShadow: "-3px 4px 4px 0px rgba(0,0,0,0.08)",
    marginTop: 8,
    maxWidth: "40em",
  },
  messageBubbleRight: {
    borderRadius: "10px 0 10px 10px",
  },
  inputRow: {
    display: "flex",
    alignItems: "flex-end",
  },
  form: {
    width: "100%",
  },
  avatar: {
    margin: theme.spacing(1, 1.5),
  },
  listItem: {
    display: "flex",
    width: "100%",
  },
  listItemRight: {
    flexDirection: "row-reverse",
  },
  typingText: {
    paddingLeft: "2%",
    color: "#555"
  }
}));

const ChatBox = (props) => {
  const [currentUserId] = useState(
    authenticationService.currentUserValue.userId
  );
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [lastMessage, setLastMessage] = useState(null);

  const [typingTxt, setState] = useState("");

  const getGlobalMessages = useGetGlobalMessages();
  const sendGlobalMessage = useSendGlobalMessage();
  const getConversationMessages = useGetConversationMessages();
  const sendConversationMessage = useSendConversationMessage();
  const SendCoversationImage = useSendCoversationImage();

  let typing=false;
  //let typingTxt = "typing...";
  let timeout=undefined;

  let chatBottom = useRef(null);
  const classes = useStyles();

  useEffect(() => {
    reloadMessages();
    scrollToBottom();
  }, [lastMessage, props.scope, props.conversationId]);

  useEffect(() => {
    const socket = socketIOClient(process.env.REACT_APP_API_URL);
    socket.on("messages", (data) => {
      console.log("Divya here");
      setLastMessage(data);
    });
  }, []);

  useEffect(() => {
    const socket = socketIOClient(process.env.REACT_APP_API_URL);
    socket.on('display', (data)=>{
      console.log("type :: "+data.typing);
      console.log("type00 :: "+typing);

      typing = data.typing;
      if(data.typing == true){
        console.log("typing...");
        setState("typing...");
        setTimeout(() => {
          setState(getNextState());
        }, 3000);
        //setTimeout(setState(""), 5000);
      } else {
        console.log("clear");
        setState("");
      }
    })
  });

  const getNextState = () => {
    return "";
  }

  const reloadMessages = () => {
    if (props.scope === "Global Chat") {
      // getGlobalMessages().then((res) => {
      //   setMessages(res);
      // });
    } else if (props.scope !== null && props.conversationId !== null) {
      console.log("hhhh ::"+JSON.stringify(props));
      getConversationMessages(props.user._id).then((res) => setMessages(res));
    } else {
      setMessages([]);
    }
  };

  const scrollToBottom = () => {
    chatBottom.current.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (props.scope === "Global Chat") {
      // sendGlobalMessage(newMessage).then(() => {
      //   setNewMessage("");
      // });
    } else {
      sendConversationMessage(props.user._id, newMessage).then((res) => {
        setNewMessage("");
      });
    }
  };

  const setTyping = (e) => {
    console.log("emmiting");
    if(e.which!=13){
      const socket = socketIOClient(process.env.REACT_APP_API_URL);
      socket.emit("typings", {typing: true });
      
    } else{
      const socket = socketIOClient(process.env.REACT_APP_API_URL);
      socket.emit("typings", {typing: false });
    }
  }

  const onDrop = (files) => {
    console.log(files);
    let formData = new FormData;

    const config = {
      header: { 'content-type': 'multipart/form-data' }
    }

    formData.append("file", files[0])

    SendCoversationImage(props.user._id, files[0]).then((res) => {
      setNewMessage("");
    });
    
  }

  return (
    <Grid container className={classes.root}>
      <Grid item xs={12} className={classes.headerRow}>
        <Paper className={classes.paper} square elevation={2}>
          <Typography color="inherit" variant="h6">
            {props.scope}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Grid container className={classes.messageContainer}>
          <Grid item xs={12} className={classes.messagesRow}>
            {messages && (
              <List>
                {messages.map((m) => (
                  <ListItem
                    key={m._id}
                    className={classnames(classes.listItem, {
                      [`${classes.listItemRight}`]:
                        m.fromObj[0]._id === currentUserId,
                    })}
                    alignItems="flex-start"
                  >
                    <ListItemAvatar className={classes.avatar}>
                      <Avatar>
                        {commonUtilites.getInitialsFromName(m.fromObj[0].name)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      classes={{
                        root: classnames(classes.messageBubble, {
                          [`${classes.messageBubbleRight}`]:
                            m.fromObj[0]._id === currentUserId,
                        }),
                      }}
                      primary={m.fromObj[0] && m.fromObj[0].name}
                      secondary={<React.Fragment>{m.body}<span></span></React.Fragment>}
                    />
                  </ListItem>
                ))}
              </List>
            )}
            <div ref={chatBottom} />
          </Grid>
          <span className={classes.typingText}>{typingTxt}</span>
          <Grid item xs={12} className={classes.inputRow}>
            <form onSubmit={handleSubmit} className={classes.form}>
              <Grid
                container
                className={classes.newMessageRow}
                alignItems="flex-end"
              >
                <Grid item xs={10}>
                  <TextField
                    id="message"
                    label="Message"
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDownCapture={(e) => setTyping(e)}
                  />
                </Grid>
                <Grid item xs={1}>
                  <IconButton type="submit">
                    <SendIcon />
                  </IconButton>
                  
                </Grid>
                <Grid item xs={1}>
                <Dropzone onDrop={onDrop}>
                  {({getRootProps, getInputProps}) => (
                    <section>
                      <div {...getRootProps()}>
                        <input {...getInputProps()} />
                        <IconButton>
                          <CloudUploadIcon/>
                        </IconButton>                      
                      </div>
                    </section>
                  )}
                </Dropzone>
                </Grid>
              </Grid>
            </form>
          </Grid>
        </Grid>
        </Grid>
    </Grid>
  );
};

export default ChatBox;