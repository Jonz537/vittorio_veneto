import {get, onValue, ref, query, limitToLast, onChildAdded, orderByKey} from "firebase/database";
import { getDownloadURL, ref as storageRef } from "firebase/storage";
import {deleteChat, exitChat} from "./chatManager";
import {set_chat_world} from "./index";

async function addChatButton(chat, property, database, storage, user_id) {
    const chatId = chat.chatname.replace(/\s/g, "_");

    $("#chat_lists").append(`
    <div value="${property}" id="${chatId}" class="sidebarChats">
      <div class="sidebarChatsName">${chat.chatname}</div>
      <div class="sidebarChatsLastMessage">
        <div class="sidebarChatsLastMessageText margin-right-1" id="lasto-${chat.chatname}"></div>
        <div class="sidebarChatsLastMessageHour" id="orao-${chat.chatname}"></div>
      </div>
    </div>
  `);

    document.getElementById(chatId).addEventListener('click', () => {
        set_chat_world(chatId);
        let chat_world_id = property;
        $("#chat_name_title").text(chat.chatname);
        handleChatClick(chatId, chat_world_id, database, storage, user_id)
    });

    const lastMessageQuery = query(ref(database, `chat/messages/${chat.chatname}/messages`), orderByKey(), limitToLast(1));

    await onValue(lastMessageQuery, (snapshot) => {
        snapshot.forEach(childSnapshot => {
            const msg = childSnapshot.val();
            $(`#lasto-${chat.chatname}`).text(msg.text.substring(0, 12));
            $(`#orao-${chat.chatname}`).text(msg.date);
        });
    });
}

async function handleChatClick(chat_world, chat_world_id, database, storage, user_id) {
    $("#chat_name_title").html(chat_world);

    const imageRef = ref(database, 'chat/messages/' + chat_world);
    const snapshotImg = await get(imageRef);

    const imagePath = snapshotImg.val()?.img;

    if (imagePath) {
        const imageUrl = await getDownloadURL(storageRef(storage, 'gs://trentochat.appspot.com/images/' + imagePath));
        $("#chat_picture").prop("src", imageUrl);
    } else {
        console.error("Image path not found in the database.");
    }

    document.getElementById("delete_chat").addEventListener("click", () => deleteChat(database, chat_world));
    document.getElementById("exit_chat").addEventListener("click", () => exitChat(database, chat_world, chat_world_id, user_id));

    const messagesRef = ref(database, 'chat/messages/' + chat_world + '/messages');
    const userList = {};
    let loadedMessageIds = new Set();

    // Initial load
    try {
        const snapshot = await get(messagesRef);
        const messages = snapshot.val();
        if (!messages) return;

        $("#messages_drugs").html("");

        for (const messageId in messages) {
            if (!messages.hasOwnProperty(messageId)) continue;
            loadedMessageIds.add(messageId);

            const message = messages[messageId];

            await addText(message, user_id, messageId, userList, database, storage);
        }
        document.getElementById("messages_drugs").scrollTo(0, document.getElementById("messages_drugs").scrollHeight);
    } catch (error) {
        console.error("Error loading messages:", error);
    }

    // Add listener for new messages
    onChildAdded(messagesRef, async (snapshot) => {
        const messageId = snapshot.key;
        const message = snapshot.val();

        if (loadedMessageIds.has(messageId)) return;
        loadedMessageIds.add(messageId);

        await addText(message, user_id, messageId, userList, database, storage);

        document.getElementById("messages_drugs").scrollTo(0, document.getElementById("messages_drugs").scrollHeight);
    });

}

async function addText(message, user_id, messageId, userList, database, storage) {
    const isSender = message.sender === user_id;

    if (message.type === "text") {
        await handleTextMessage(message, messageId, isSender, userList, database);
    } else if (message.type === "image") {
        await handleMediaMessage(message, messageId, storage, "images", isSender);
    } else if (message.type === "audio") {
        await handleMediaMessage(message, messageId, storage, "audios", isSender);
    }
}

async function handleTextMessage(message, messageId, isSender, userList, database) {
    if (isSender) {
        $("#messages_drugs").append(`<div id='${messageId}' class='messageDiv'><span class='message_send'>${message.text}</span><br><span class='message_send_data'>${message.date}</span></div>`);
    } else {
        if (!userList[message.sender]) {
            const userSnap = await get(ref(database, "chat/users/" + message.sender));
            userList[message.sender] = userSnap.exists() ? userSnap.val().name : "dead_user";
        }
        $("#messages_drugs").append(`<div class='messageDiv' id='${messageId}'><span class='message_rec_data'>${userList[message.sender]}</span><br><span class='message_rec'>${message.text}</span><br><span class='message_rec_data'>${message.date}</span></div>`);
    }
}


async function handleMediaMessage(message, messageId, storage, folder, isSender) {
    try {
        const url = await getDownloadURL(storageRef(storage, `gs://trentochat.appspot.com/${folder}/` + message.text));
        const mediaHtml = folder === "audios"
            ? `<audio controls id='${messageId}' class='' src='${url}'></audio>`
            : `<img id='${messageId}' class='image_chat' src='${url}' alt="">`;
        const className = isSender ? 'message_send_data' : 'message_rec_data';
        $("#messages_drugs").append(`<p class='${isSender ? "text-end" : ""}'><span class=''>${mediaHtml}</span><br><span class='rounded ${className} p-1'>${message.date}</span></p>`);

        if (folder === "images") {
            document.getElementById(messageId).onclick = function () {
                let modal = document.getElementById("myModal");
                let modalImg = document.getElementById("img01");
                modalImg.src = $(this).attr('src');
                modal.style.display = "block";
            };
        }
    } catch (error) {
        console.log("Media download error: ", error);
    }
}

export {addChatButton}