import {getTimeString, request} from "./Utils";
import {push, ref, set} from "firebase/database";
import {initializeChatView, loadChatPage, remove_chat_world} from "./index";
import {ref as storageRef, uploadBytes} from "firebase/storage";

function send(database, chatWorld, userId, storage) {

    const fileInput = document.getElementById("myFile");

    if(chatWorld){
        let messagge = $("#send_message").val().trim();
        let file = fileInput.files[0];
        if((messagge !== "" && file === undefined)){
            sendMessage(database, chatWorld, userId)
                .catch((error) => console.log(error));
        }
        else if (file) {
            sendFile(database, chatWorld, userId, storage, file)
                .then(() => fileInput.value = "")
                .catch((error) => {console.log(error)})
        }
    }
}

async function sendMessage(database, chatWorld, userId) {
    const postListRef = ref(database, 'chat/messages/' + chatWorld + '/messages');
    const newPostRef = push(postListRef);

    await set(newPostRef, {
        date: getTimeString(),
        sender: userId,
        text : $("#send_message").val(),
        type: "text"
    });

    $('#send_message').val('');
}

async function sendFile(database, chatWorld, userId, storage, file) {
    const postListRef = ref(database, 'chat/messages/' + chatWorld + '/messages');
    const newPostRef = push(postListRef);


    document.getElementById("myFile").setAttribute("files", "");
    const uploadRef = storageRef(storage, 'images/' + newPostRef.key);

    await uploadBytes(uploadRef, file).then(async () => {
        await set(newPostRef, {
            date: getTimeString(),
            sender: userId,
            text : newPostRef.key ,
            type: "image"
        });
    });
}

function deleteChat(database, chatWorld, userId, storageRef, storage) {
    request("Are you sure?", "Do you really want to delete all the messages from this chat? \n They will be lost forever");

    $("#confirm_modal").off().on('click', async function () {
        await set(ref(database, "chat/messages/" + chatWorld + "/messages"), {
            first: "first"
        }).then(() => loadChatPage()
            .then(() => initializeChatView(database, userId, storageRef, storage))
        ).catch((error) => console.log("error deleting the chat: " + error))
    });
}

function exitChat(database, chatWorld, chatWorldId, userId) {
    request("Are you sure?", "Do you really want to exit this chat?");

    $("#confirm_modal").off().on('click', async function () {
        // console.log(chat_world_id);
        await set(ref(database,"chat/users/" + userId + "/chats/" + chatWorldId), {
            chatname: null
        }).then(() => {
            remove_chat_world();
            $("#messages_in_chat").empty();
            $("#chat_picture").attr('src', null);
            $("#chat_name_title").html('');
        })
        ;

    });
}

export {send, sendMessage, deleteChat, exitChat}