import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";
import { getStorage, ref as storageRef } from "firebase/storage";
import { getAuth, signInWithEmailAndPassword} from "firebase/auth";
import {forgot, registerAuth} from "./RegisterAuth";
import {send} from "./chatManager";
import {startVoice} from "./VoiceManager";
import {initializeView} from "./userManager";
import {addChatButton} from "./LoadChat";
//Thing needed to establish connection with firebase
const firebaseConfig = require('./firebaseConfig');

document.body.style.zoom = "100%";

let chat_world;
let file_to_upload = false;

let menu_hid = $("#menu_hid");
let send_elem = $("#send");

let modal = document.getElementById("myModal");

// TODO ALL moderator stuff: admin.html, visualize reported messages, ban evil users

const { auth, database, storage } = initializeFirebase();
setupEventListeners(auth, database, storage)

function initializeFirebase() {
  const firebaseApp = initializeApp(firebaseConfig);
  return {
    auth: getAuth(),
    database: getDatabase(firebaseApp),
    storage: getStorage(firebaseApp)
  };
}

function setupEventListeners(auth, database, storage) {
  $("#login").on("click", () => handleLogin(auth, database, storage));

  modal.onclick = function() {
    modal.style.display = "none";
    menu_hid.addClass("btn-outline-secondary");
    menu_hid.removeAttr("style")
    send_elem.addClass("btn-outline-secondary");
    send_elem.removeAttr("style")
  }

  $("#signup").on('click', () =>  {
    $("#signup_div").prop("hidden", false);
    $("#login_div").prop("hidden", true);
  });

  $("#back_register_button").on('click', () =>  {
    $("#signup_div").prop("hidden", true);
    $("#login_div").prop("hidden", false);
  });

  $("#register_button").on('click', () => registerAuth(database));

  $("#forgot").on("click", () => forgot(auth));

  $(document).on('change','#myFile' , () =>  file_to_upload = true);

}

async function handleLogin(auth, database, storage) {
  const email = $("#username").val();
  const password = $("#password").val();

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const user_id = user.uid;

    $("#login_div").prop("hidden", true);
    $("#chat_div").prop("hidden", false);

    initializeView(database, user_id, storageRef, storage);
    loadUserChats(database, user_id, storage);
    setupMessageSending(database, user_id, storage);

  } catch (error) {
    console.error("Login failed:", error.message);
  }
}


function loadUserChats(database, user_id, storage) {
  const usernameReference = ref(database, 'chat/users/' + user_id);

  onValue(usernameReference, async (snapshot) => {
    const username = snapshot.val();
    $("#user_name").html(`${username.name}<br>`);
    $("#chat_lists").empty();

    for (let property in username.chats) {
      if (!username.chats.hasOwnProperty(property)) continue;
      const chat = username.chats[property];
      await addChatButton(chat, property, database, storage, user_id);
    }
  });
}


function setupMessageSending(database, user_id, storage) {
  $(document).on("keydown", (event) => {
    if (event.key === "Enter") {
      send(database, chat_world, user_id, file_to_upload, storage);
    }
    // else if (event.key === "p") {
    //   window.location.hash = "#anotherpage";
    // }
  })

  send_elem.on('click', () => send(database, chat_world, user_id, file_to_upload, storage));

  $("#voice").on('click', () => startVoice(database, user_id, chat_world, storage));
}

function set_chat_world(chat_to_set) {
  chat_world = chat_to_set;
}

function remove_chat_world() {
  chat_world = undefined;
}

export {remove_chat_world, set_chat_world}
