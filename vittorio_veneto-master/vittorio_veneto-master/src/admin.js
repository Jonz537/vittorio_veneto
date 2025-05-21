fetch("http://localhost:3000/disable-user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid: "UID here" })
})
    .then(res => res.text())
    .then(msg => console.log(msg))
    .catch(err => console.error(err));