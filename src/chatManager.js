import {getTimeString, request} from "./Utils";
import {push, ref, set} from "firebase/database";
import {ref as storageRef, uploadBytes} from "firebase/storage";
import {remove_chat_world} from "./index";

function send(database, chat_world, user_id, file_to_upload, storage) {
    if(chat_world){
        if(($("#send_message").val() !== "" )){
            sendMessage(database, chat_world, user_id)
                .catch((error) => console.log(error));
        } else if (file_to_upload) {
            sendFile(database, chat_world, user_id, storage)
                .then(() => file_to_upload = false)
                .catch((error) => {console.log(error)})
        }
    }
}

async function sendMessage(database, chat_world, user_id) {
    const postListRef = ref(database, 'chat/messages/' + chat_world + '/messages');
    const newPostRef = push(postListRef);

    await set(newPostRef, {
        date: getTimeString(),
        sender: user_id,
        text : $("#send_message").val(),
        type: "text"
    });

    $('#send_message').val('');
}

async function sendFile(database, chat_world, user_id, storage) {
    const postListRef = ref(database, 'chat/messages/' + chat_world + '/messages');
    const newPostRef = push(postListRef);

    let file = document.getElementById("myFile").files[0];
    const uploadRef = storageRef(storage, 'images/' + newPostRef.key);

    await uploadBytes(uploadRef, file).then(() => {
        console.log('Uploaded a blob or file!');
    });

    await set(newPostRef, {
        date: getTimeString(),
        sender: user_id,
        text : newPostRef.key ,
        type: "image"
    });


}

function deleteChat(database, chat_world) {
    request("Are you sure?", "Do you really want to delete all the messages from this chat? \n They will be lost forever");

    document.getElementById("confirm_modal").addEventListener('click', function () {
        set(ref(database, "chat/messages/" + chat_world + "/messages"), {

        }).catch((error) => console.log("error deleting the chat: " + error));
    }, {once:true});
}

function exitChat(database, chat_world, chat_world_id, user_id) {
    request("Are you sure?", "Do you really want to exit this chat?");

    document.getElementById("confirm_modal").addEventListener('click', async function () {

        // console.log(chat_world_id);
        await set(ref(database,"chat/users/" + user_id + "/chats/" + chat_world_id), {
            chatname: null
        }).then(() => {
            remove_chat_world();
            $("#messages_drugs").empty();
            $("#chat_picture").attr('src', null);
            $("#chat_name_title").html('');
        })
        ;



    });
}

export {send, sendMessage, sendFile, deleteChat, exitChat}