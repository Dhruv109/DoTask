const myForm = document.querySelector(".form");
const groupName = document.getElementById("name");
const members = document.getElementById("members");
const container = document.querySelector(".container");
const groupList = document.querySelector(".group-list");

myForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let memberArrayold = members.value.split(",");
  let memberArray = memberArrayold.map((member) => member.trim());

  let myHeaders = new Headers();
  const data = { name: groupName.value, members: memberArray };
  const raw = JSON.stringify(data);
  myHeaders.append("Content-Type", "application/json");
  let requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };
  fetch("./api/group/makegroup", requestOptions)
    .then((res) => res.text())
    .then((test) => {
      //history.go();
      setTimeout(() => window.location.reload(), 1000);
    });
  console.log(memberArray);
});

document.addEventListener("DOMContentLoaded", getTodos);

function getTodos() {
  fetch("./api/group/getgroups")
    .then((response) => response.json())
    .then((groups) => {
      if (groups.length != 0) {
        groups.forEach((group) => {
          fetch(`./api/group/groupname/${group}`)
            .then((response) => response.text())
            .then((name) => {
              let mydiv = document.createElement("div");
              mydiv.classList.add("group-div");
              mydiv.innerHTML = `<li><h2 class='my-groups'>${name.toUpperCase()}<span class="group-id">${group}</span></h2></li>`;
              groupList.appendChild(mydiv);
            });
        });
      }
    });
}

groupList.addEventListener("click", openGroupPage);

function openGroupPage(e) {
  const groupid = e.target.querySelector(".group-id").innerText;
  sessionStorage.setItem("group", JSON.stringify(groupid));
  window.location.replace("./indigroup.html");
}
