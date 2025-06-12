import { initializeApp } from "firebase/app";
import {getDatabase, onValue, ref} from "firebase/database";
import {getDownloadURL, getStorage, ref as storageRef} from "firebase/storage";
import { getAuth, signInWithEmailAndPassword} from "firebase/auth";
import {initializeLoginPage, initializerJoinGroupPage, initializerRegisterPage} from "./listenerManager";
import {send} from "./chatManager";
import {startVoice} from "./VoiceManager";
import {addChatButton} from "./LoadChat";
import {User} from "./User";
import {warning} from "./Utils";

const firebaseConfig = require('./firebaseConfig');

document.body.style.zoom = "100%";

let chatWorld;
let fileToUpload = false;
let userRole = undefined;

let menu_hid = $("#menu_hid");
let send_elem = $("#send");

let modal = document.getElementById("myModal");

// TODO ALL ADMiN stuff: nomeUtente | ruolo | stato (bannanato o no) | btn banna | btn sbanna | btn promuvoi | btn declassare
// TODO FIX immagini che buggano tutto
// TODO MODERATOR PUÒ bannare gli utenti nella sue chat
// TODO FIX create group chat siuum

let activeUser;

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

  $(document).on('change','#myFile' , () =>  fileToUpload = true);
}

async function handleLogin(auth, database, storage) {
  const email = $("#username").val();
  const password = $("#password").val();

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const userId = user.uid;

    auth.currentUser.getIdTokenResult()
        .then((idTokenResult) => {
          const claims = idTokenResult.claims;
          userRole = claims.role;

          if (claims.role === "admin") {
            console.log("User is an admin");
          } else {
            loadChatPage()
                .then(() => initializeChatView(database, userId, storageRef, storage))
                .catch((error) => console.log(error));
          }
        });
  } catch (error) {
    if (error.code === 'auth/user-disabled') {
      warning("Il tuo account è stato disabilitato!")
    } else {
      console.error("Login failed:", error.message);
    }
  }
}

function initializeChatView(database, userId, storageRef, storage) {

  //Download image
  getDownloadURL(storageRef(storage, 'gs://trentochat.appspot.com/images/Wallpaper_2.jpg'))
      .then((url) => $("#pfp").prop('src', url))
      .catch((error) => console.log("Image error:" + error));

  //Download users username
  document.getElementById("newChat").addEventListener('click', function(){
    loadGroupPage()
        .then(() => initializerJoinGroupPage(database, userId, storageRef, storage))
        .catch((error) => console.log(error));
  });

  loadUserChats(database, userId, storage);
  setupMessageSending(database, userId, storage);
}

function loadUserChats(database, userId, storage) {
  const usernameReference = ref(database, 'chat/users/' + userId);

  onValue(usernameReference, async (snapshot) => {
    const user = snapshot.val();

    activeUser = new User(user.name, user.roles);

    $("#user_name").html(`${user.name}<br>`);
    $("#chat_lists").empty();

    for (let property in user.chats) {
      if (!user.chats.hasOwnProperty(property)) continue;
      const chat = user.chats[property];
      await addChatButton(chat, property, database, storage, userId);
    }
  });
}

function setupMessageSending(database, userId, storage) {
  $(document).on("keydown", (event) => {
    if (event.key === "Enter") {
      send(database, chatWorld, userId, fileToUpload, storage);
    }
  })

  $("#voice").on('click', () => startVoice(database, userId, chatWorld, storage));
}

export function set_chat_world(chatToSee) {
  chatWorld = chatToSee;
}

export function remove_chat_world() {
  chatWorld = undefined;
}

export function setFileToUpload(info) {
  fileToUpload = info;
}

export function getUserRole() {
  return userRole;
}

export {loadChatPage, loadLoginPage, loadRegisterPage, handleLogin,
  loadGroupPage, setupMessageSending, loadUserChats, initializeChatView}
