import {getTimeString, request} from "./Utils";
import {push, ref, set} from "firebase/database";
import {ref as storageRef, uploadBytes} from "firebase/storage";
import {setFileToUpload, remove_chat_world} from "./index";

function send(database, chatWorld, userId, fileToUpload, storage) {
    if(chatWorld){
        if(($("#send_message").val() !== "" )){
            sendMessage(database, chatWorld, userId)
                .catch((error) => console.log(error));
        } else if (fileToUpload) {
            sendFile(database, chatWorld, userId, storage)
                .then(() => fileToUpload = false)
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

// async function sendFile(database, chatWorld, userId, storage) {
//     const postListRef = ref(database, 'chat/messages/' + chatWorld + '/messages');
//     const newPostRef = push(postListRef);
//
//     let file = document.getElementById("myFile").files[0];
//     const uploadRef = storageRef(storage, 'images/' + newPostRef.key);
//
//     await uploadBytes(uploadRef, file).then(() => {
//         console.log('Uploaded a blob or file!');
//     });
//
//     await set(newPostRef, {
//         date: getTimeString(),
//         sender: userId,
//         text : newPostRef.key ,
//         type: "image"
//     });
//
//     setFileToUpload(false);
// }

function deleteChat(database, chatWorld) {
    request("Are you sure?", "Do you really want to delete all the messages from this chat? \n They will be lost forever");

    document.getElementById("confirm_modal").addEventListener('click', function () {
        set(ref(database, "chat/messages/" + chatWorld + "/messages"), {

        }).catch((error) => console.log("error deleting the chat: " + error));
    }, {once:true});
}

function exitChat(database, chatWorld, chatWorldId, userId) {
    request("Are you sure?", "Do you really want to exit this chat?");

    document.getElementById("confirm_modal").addEventListener('click', async function () {

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