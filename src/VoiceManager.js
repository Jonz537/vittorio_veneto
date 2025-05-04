import {push, ref, set} from "firebase/database";
import {getTimeString} from "./Utils";
import {ref as storageRef, uploadBytes} from "firebase/storage";

async function startVoice(database, user_id, chat_world, storage){

    $("#voice").prop("hidden", true);
    $("#btnStop").prop("hidden", false);

    let constraintObj = {
        audio: true,
        video: false
    };

    let stream = await navigator.mediaDevices.getUserMedia(constraintObj);
    let mediaRecorder = new MediaRecorder(stream);
    let chunks = [];

    mediaRecorder.start();

    document.getElementById('btnStop').addEventListener('click', ()=>{
        $("#btnStop").prop("hidden", true);
        $("#voice").prop("hidden", false);
        mediaRecorder.stop();
        console.log(mediaRecorder.state);
    }, {once:true});


    mediaRecorder.ondataavailable = function(ev) {
        chunks.push(ev.data);
    };

    mediaRecorder.onstop = async function() {
        let blob = new Blob(chunks, { 'type' : 'audio/mpeg' });
        chunks = [];

        stream.getTracks() // get all tracks from the MediaStream
            .forEach( track => track.stop()); // stop each of them

        if(chat_world) {

            const postListRef = ref(database, 'chat/messages/' + chat_world + '/messages');
            const newPostRef = push(postListRef);

            await set(newPostRef, {
                date: getTimeString(),
                sender: user_id,
                text : newPostRef.key,
                type: "audio"
            });

            const audioRef = storageRef(storage, 'audios/' + newPostRef.key);
            uploadBytes(audioRef, blob).catch((error) => {
                console.log(error)
            });
        }
    };
}

export {startVoice}