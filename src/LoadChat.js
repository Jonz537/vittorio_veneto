import {get, onValue, ref, query, limitToLast, onChildAdded, orderByKey} from "firebase/database";
import { getDownloadURL, ref as storageRef } from "firebase/storage";
import {deleteChat, exitChat, send} from "./chatManager";
import {getUserRole, set_chat_world} from "./index";
import {startVoice} from "./VoiceManager";
import {requestFoot} from "./Utils";
import {banUser} from "./admin";

const firebaseListeners = {
    chatMessageListeners: {},
};

async function addChatButton(chat, property, database, storage, userId) {
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

    const chatNamespace = `chat-${chatId}`;  // simple namespace, no #

    $(document).off(`click.${chatNamespace}`);
    $(document).on(`click.${chatNamespace}`, `#${chatId}`, () => {
        set_chat_world(chatId);
        let chat_world_id = property;
        $("#chat_name_title").text(chat.chatname);
        handleChatClick(chatId, chat_world_id, database, storage, userId);
    });

    const lastMessageQuery = query(ref(database, `chat/messages/${chat.chatname}/messages`), orderByKey(), limitToLast(1));

    await onValue(lastMessageQuery, (snapshot) => {
        snapshot.forEach(childSnapshot => {
            const msg = childSnapshot.val();
            $(`#lasto-${chat.chatname}`).text(msg.text.substring(0, 12));
            $(`#orao-${chat.chatname}`).text(msg.date);
        });
    });

    const fileInput = document.getElementById("myFile");
    const previewIndicator = document.getElementById("file-preview-indicator");

    fileInput.addEventListener("change", (event) => {
        if (fileInput.files[0]) {
            previewIndicator.classList.remove("hidden");
            document.getElementById("file-send-wrapper").addEventListener("click", showModalPreview);
        } else {
            previewIndicator.classList.add("hidden");
            document.getElementById("file-send-wrapper").removeEventListener("click", showModalPreview);
        }
    });
}

async function handleChatClick(chatWorld, chatWorldId, database, storage, userId) {
    $("#chat_name_title").html(chatWorld);

    const imageRef = ref(database, 'chat/messages/' + chatWorld);
    const snapshotImg = await get(imageRef);

    const imagePath = snapshotImg.val()?.img;

    if (imagePath) {
        const imageUrl = await getDownloadURL(storageRef(storage, 'gs://trentochat.appspot.com/images/' + imagePath));
        $("#chat_picture").prop("src", imageUrl);
    } else {
        console.error("Image path not found in the database.");
    }

    document.getElementById("delete_chat").addEventListener("click", () => deleteChat(database, chatWorld));
    document.getElementById("exit_chat").addEventListener("click", () => exitChat(database, chatWorld, chatWorldId, userId));

    const messagesRef = ref(database, 'chat/messages/' + chatWorld + '/messages');
    const userList = {};
    let loadedMessageIds = new Set();

    // Initial load
    try {
        const snapshot = await get(messagesRef);
        const messages = snapshot.val();
        if (!messages) return;

        $("#messages_in_chat").html("");

        for (const messageId in messages) {
            if (!messages.hasOwnProperty(messageId)) continue;
            loadedMessageIds.add(messageId);

            const message = messages[messageId];

            await addText(message, userId, messageId, userList, database, storage);
        }
        document.getElementById("messages_in_chat").scrollTo(0, document.getElementById("messages_in_chat").scrollHeight);
    } catch (error) {
        console.error("Error loading messages:", error);
    }

    if (!firebaseListeners.chatMessageListeners[chatWorld]) {
        const listener = async (snapshot) => {
            const messageId = snapshot.key;
            const message = snapshot.val();

            if (loadedMessageIds.has(messageId)) return;
            loadedMessageIds.add(messageId);

            await addText(message, userId, messageId, userList, database, storage);
            document.getElementById("messages_in_chat").scrollTo(0, document.getElementById("messages_in_chat").scrollHeight);
        };

        onChildAdded(messagesRef, listener);
        firebaseListeners.chatMessageListeners[chatWorld] = listener;
    }
}

async function addText(message, userId, messageId, userList, database, storage) {
    const isSender = message.sender === userId;

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
        $("#messages_in_chat").append(`<div id='${messageId}' class='messageDiv'><span class='message_send'>${message.text}</span><br><span class='message_send_data'>${message.date}</span></div>`);
    } else {
        if (!userList[message.sender]) {
            const userSnap = await get(ref(database, "chat/users/" + message.sender));
            userList[message.sender] = userSnap.exists() ? userSnap.val().name : "dead_user";
        }
        $("#messages_in_chat").append(`<div class='messageDiv' id='${messageId}'><span class='message_rec_sender'>${userList[message.sender]}</span><br><span class='message_rec'>${message.text}</span><br><span class='message_rec_data'>${message.date}</span></div>`);
        if (getUserRole() === "moderator") {
            addBanningOption(messageId, message.sender);
        }
    }
}

function addBanningOption(messageId, senderId) {
    document.getElementById(messageId).addEventListener("click", () => {
        requestFoot("Confermi?",
            `Vuoi davvero bannare questo utente (userId: ${senderId})?`,
            "<button type='button' class='btn btn-danger chiudi' data-bs-dismiss='modal'>Cancel</button><button class='btn btn-success' id='forgot_conf' data-bs-dismiss='modal'>Confirm</button> ");
        $("#confirm_modal").off("click").on("click",() => {
            banUser(senderId);
        });
    })
}

async function handleMediaMessage(message, messageId, storage, folder, isSender) {
    try {
        const url = await getDownloadURL(storageRef(storage, `gs://trentochat.appspot.com/${folder}/` + message.text));
        const mediaHtml = folder === "audios"
            ? `<audio controls id='${messageId}' class='' src='${url}'></audio>`
            : `<img id='${messageId}' class='image_chat' src='${url}' alt="">`;
        const className = isSender ? 'message_send_data' : 'message_rec_data';
        $("#messages_in_chat").append(`<p class='${isSender ? "text-end" : ""}'><span class=''>${mediaHtml}</span><br><span class='rounded ${className} p-1'>${message.date}</span></p>`);

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

function showModalPreview() {
    const fileInput = document.getElementById("myFile");
    let modal = document.getElementById("myModal");
    let modalImg = document.getElementById("img01");
    modalImg.src = URL.createObjectURL(fileInput.files[0]);
    modal.style.display = "block";
}

export {addChatButton}