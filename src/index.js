import { initializeApp } from "firebase/app";
import {getDatabase, onValue, ref} from "firebase/database";
import {getDownloadURL, getStorage, ref as storageRef} from "firebase/storage";
import { getAuth, signInWithEmailAndPassword} from "firebase/auth";
import {initializeLoginPage, initializerJoinGroupPage, initializerRegisterPage} from "./listenerManager";
import {send} from "./chatManager";
import {startVoice} from "./VoiceManager";
import {addChatButton} from "./LoadChat";

const firebaseConfig = require('./firebaseConfig');

document.body.style.zoom = "100%";

let chat_world;
let file_to_upload = false;

let menu_hid = $("#menu_hid");
let send_elem = $("#send");

let modal = document.getElementById("myModal");

// TODO ALL moderator stuff: admin.html, visualize reported messages, ban evil users

const { auth, database, storage } = initializeFirebase();
setUp();

function initializeFirebase() {
  const firebaseApp = initializeApp(firebaseConfig);
  return {
    auth: getAuth(),
    database: getDatabase(firebaseApp),
    storage: getStorage(firebaseApp)
  };
}

function setUp() {
  loadLoginPage().then(
      () => setupEventListeners()
  );

}

async function loadLoginPage() {
  const res = await fetch('templates/login_template.html');
  const text = await res.text();
  document.body.insertAdjacentHTML('beforeend', text);
  const template = document.getElementById('login_temp').content.cloneNode(true);
  document.getElementById('app').replaceChildren(template);

  initializeLoginPage(auth, database, storage)
}

async function loadChatPage() {
  const res = await fetch('templates/chat_template.html');
  const text = await res.text();
  document.body.insertAdjacentHTML('beforeend', text);
  const template = document.getElementById('chat_temp').content.cloneNode(true);
  document.getElementById('app').replaceChildren(template);
}

async function loadRegisterPage() {
  const res = await fetch('templates/register_template.html');
  const text = await res.text();
  document.body.insertAdjacentHTML('beforeend', text);
  const template = document.getElementById('register_temp').content.cloneNode(true);
  document.getElementById('app').replaceChildren(template);

  initializerRegisterPage(database);
}

async function loadGroupPage() {
  const res = await fetch('templates/group_template.html');
  const text = await res.text();
  document.body.insertAdjacentHTML('beforeend', text);
  const template = document.getElementById('group_temp').content.cloneNode(true);
  document.getElementById('app').replaceChildren(template);
}

function setupEventListeners() {

  modal.onclick = function() {
    modal.style.display = "none";
    menu_hid.addClass("btn-outline-secondary");
    menu_hid.removeAttr("style")
    send_elem.addClass("btn-outline-secondary");
    send_elem.removeAttr("style")
  }

  $(document).on('change','#myFile' , () =>  file_to_upload = true);
}

async function handleLogin(auth, database, storage) {
  const email = $("#username").val();
  const password = $("#password").val();

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const user_id = user.uid;

    loadChatPage()
        .then(() => initializeChatView(database, user_id, storageRef, storage))
        .catch((error) => console.log(error));

  } catch (error) {
    console.error("Login failed:", error.message);
  }
}

function initializeChatView(database, user_id, storageRef, storage) {

  //Download image
  getDownloadURL(storageRef(storage, 'gs://trentochat.appspot.com/images/Wallpaper_2.jpg'))
      .then((url) => $("#pfp").prop('src', url))
      .catch((error) => console.log("Image error:" + error));

  //Download users username
  document.getElementById("newChat").addEventListener('click', function(){
    loadGroupPage()
        .then(() => initializerJoinGroupPage(database, user_id, storageRef, storage))
        .catch((error) => console.log(error));
  });

  loadUserChats(database, user_id, storage);
  setupMessageSending(database, user_id, storage);
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

export {remove_chat_world, set_chat_world, loadChatPage, loadLoginPage,
  loadRegisterPage, handleLogin, loadGroupPage, setupMessageSending, loadUserChats,
  initializeChatView}
