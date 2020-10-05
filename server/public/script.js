//selectors
const todoInput = document.querySelector(".todo-input");
const todoButton = document.querySelector(".todo-button");
const todoList = document.querySelector(".todo-list");
const filterOption = document.querySelector(".todo-filter");
const header = document.querySelector(".head");
const select = document.querySelector(".select");
const inp = document.querySelector(".inp");
const slider = document.querySelector(".slider");
const logout = document.querySelector(".logout");

let complete = [],
  todos = [];

fetchcomplete(), fetchtodo();
fetchname();
//page load animation
const tl = new TimelineMax();
tl.fromTo(
  header,
  1,
  { opacity: "0", y: "10%" },
  { opacity: "1", y: "0%", ease: Power2.easeInOut }
)
  .fromTo(
    inp,
    1,
    { x: "-10%", opacity: "0" },
    { x: "0%", opacity: "1", ease: Power2.easeInOut },
    "-=1"
  )
  .fromTo(
    select,
    1,
    { x: "10%", opacity: "0" },
    { x: "0%", opacity: "1", ease: Power2.easeInOut },
    "-=1"
  );

//event listeners
document.addEventListener("DOMContentLoaded", getTodos);
todoButton.addEventListener("click", addTodo);
todoList.addEventListener("click", checkDelete);
filterOption.addEventListener("click", filterTodo);

//functions

async function fetchname() {
  fetch(`./api/user/getname`)
    .then((response) => response.text())
    .then((result) => {
      document.querySelector(".head").innerText += ` ${result.toUpperCase()}`;
    });
}

function addTodo(event) {
  //prevent default action ie form to submit
  event.preventDefault();
  if (todoInput.value != "") {
    //add todo div
    const todoDiv = document.createElement("div");
    todoDiv.classList.add("todo");

    //Create li
    const newTodo = document.createElement("li");
    newTodo.classList.add("todo-item");
    newTodo.innerText = todoInput.value;
    todoDiv.appendChild(newTodo);

    //add todo to localstorage
    saveLocalTodos(todoInput.value);
    makeComplete();

    //task completed button
    const completedButton = document.createElement("button");
    completedButton.innerHTML = '<i class="fa fa-check"></i>';
    completedButton.classList.add("completed-btn");
    todoDiv.appendChild(completedButton);

    //edit button
    const editButton = document.createElement("button");
    editButton.innerHTML = '<i class="fa fa-pencil"></i>';
    editButton.classList.add("edit-btn");
    todoDiv.appendChild(editButton);

    //delete task button
    const deleteButton = document.createElement("button");
    deleteButton.innerHTML = '<i class="fa fa-trash"></i>';
    deleteButton.classList.add("delete-btn");
    todoDiv.appendChild(deleteButton);

    //Append div to ul
    todoList.appendChild(todoDiv);

    //clear writer
    todoInput.value = "";
  } else {
    todoInput.classList.add("shake");
    todoInput.addEventListener("animationend", () => {
      todoInput.classList.remove("shake");
    });
  }
}

function checkDelete(e) {
  const item = e.target;

  if (item.classList[0] == "edit-btn") {
    const todo = item.parentElement;
    todoInput.value = todo.innerText;
    todoInput.focus();
    removelocalTodos(todo);
    todo.remove();
  }

  if (item.classList[0] === "delete-btn") {
    const todo = item.parentElement;
    todo.classList.add("fall");
    removelocalTodos(todo);
    todo.addEventListener("transitionend", () => {
      todo.remove();
    });
  }
  if (item.classList[0] === "completed-btn") {
    fetch(`./api/user/getcomplete`)
      .then((response) => response.json())
      .then((complete) => {
        const todo = item.parentElement;
        todo.classList.toggle("completed");
        item.classList.toggle("green");
        const text = todo.children[0].innerText;

        fetch(`./api/user/gettodo`)
          .then((response) => response.json())
          .then((todos) => {
            const index = todos.indexOf(text);

            updatecomplete(index, !complete[index]);
            console.log(index, complete, text, todos);
          });
      });
  }
}

function updatecomplete(index, value) {
  var myHeaders = new Headers();
  const data = { index: index, complete: value };
  const raw = JSON.stringify(data);
  myHeaders.append("Content-Type", "application/json");
  var requestOptions = {
    method: "PUT",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  fetch(`./api/user/updatecomplete`, requestOptions);
}

function filterTodo(e) {
  const todos = todoList.childNodes;
  console.log(todos);
  todos.forEach(function (item) {
    switch (e.target.value) {
      case "all":
        item.style.display = "flex";
        break;
      case "completed":
        if (item.classList.contains("completed")) {
          item.style.display = "flex";
        } else item.style.display = "none";
        break;
      case "not-completed":
        if (!item.classList.contains("completed")) {
          item.style.display = "flex";
        } else item.style.display = "none";
        break;
    }
  });
}

function saveLocalTodos(todo) {
  console.log("saving todos!");

  const data = { todo: todo };
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify(data);

  var requestOptions = {
    method: "PUT",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  fetch("./api/user/addtodo", requestOptions);
}

function getTodos() {
  fetch(`./api/user/gettodo`)
    .then((response) => response.json())
    .then((todos) => {
      console.log(todos);
      for (let i = 0; i < todos.length; ++i) {
        const todoDiv = document.createElement("div");
        todoDiv.classList.add("todo");

        //Create li
        const newTodo = document.createElement("li");
        newTodo.classList.add("todo-item");
        newTodo.innerText = todos[i];
        todoDiv.appendChild(newTodo);

        //task completed button
        const completedButton = document.createElement("button");
        completedButton.innerHTML = '<i class="fa fa-check"></i>';
        completedButton.classList.add("completed-btn");
        todoDiv.appendChild(completedButton);

        const editButton = document.createElement("button");
        editButton.innerHTML = '<i class="fa fa-pencil"></i>';
        editButton.classList.add("edit-btn");
        todoDiv.appendChild(editButton);
        //delete task button
        const deleteButton = document.createElement("button");
        deleteButton.innerHTML = '<i class="fa fa-trash"></i>';
        deleteButton.classList.add("delete-btn");
        todoDiv.appendChild(deleteButton);

        //Append div to ul
        todoList.appendChild(todoDiv);
      }
      // const complete = JSON.parse(localStorage.getItem('complete'));

      fetch(`./api/user/getcomplete`)
        .then((response) => response.json())
        .then((complete) => {
          const Todos = todoList.childNodes;
          console.log(Todos);
          for (let i = 0; i < Todos.length; ++i) {
            if (complete[i]) {
              Todos[i].classList.toggle("completed");
              Todos[i].children[1].classList.add("green");
            } else Todos[i].children[1].classList.remove("green");
          }
        });
    });
}

function removelocalTodos(todo) {
  const deltodo = todo.children[0].innerText;

  fetch(`/api/user/gettodo`)
    .then((response) => response.json())
    .then((todos) => {
      const index = todos.indexOf(deltodo);
      const data = { index: index };
      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      const raw = JSON.stringify(data);

      var requestOptions = {
        method: "PUT",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      };
      fetch(`/api/user/deletecomplete`, requestOptions);

      const data2 = { todo: deltodo };
      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      const raw2 = JSON.stringify(data2);

      var requestOptions = {
        method: "PUT",
        headers: myHeaders,
        body: raw2,
        redirect: "follow",
      };

      fetch("/api/user/deletetodo", requestOptions);
    });
}

function makeComplete() {
  const data = { complete: false };
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify(data);

  var requestOptions = {
    method: "PUT",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  fetch("./api/user/addcomplete", requestOptions);
}

async function fetchcomplete() {
  fetch(`./api/user/getcomplete`)
    .then((response) => response.json())
    .then((res) => {
      complete = res;
    });
}

async function fetchtodo() {
  fetch(`./api/user/gettodo`)
    .then((response) => response.json())
    .then((res) => {
      todos = res;
    });
}
