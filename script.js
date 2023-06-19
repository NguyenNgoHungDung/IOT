/* Note: WEB GET VALUE FROM FIREBASE
**
** These functions are automatically executed every time there is a change to the data it is pointing to on Firebase
** Therefore, we only need to call it once at the time of website initialization to get the data from Firebase
*/

/* ------------------------------------------------------------------------- */
/*                                  FIREBASE                                 */
/* ------------------------------------------------------------------------- */

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
let firebaseConfig = {
  apiKey: "AIzaSyC3xQCJOOeZgdJlz0kH6FFnwfuK3SB2RVo",
  authDomain: "fingerprint-63597.firebaseapp.com",
  databaseURL: "https://fingerprint-63597-default-rtdb.firebaseio.com",
  projectId: "fingerprint-63597",
  storageBucket: "fingerprint-63597.appspot.com",
  messagingSenderId: "25189256652",
  appId: "1:25189256652:web:e6c3f1b22e6b418d296169",
  measurementId: "G-KBHTE4QKPF"
};

/* Initialize Firebase */
firebase.initializeApp(firebaseConfig);

/* Get value from firebase to show it when first run (sync between html and firebase) */
let database = firebase.database();

/* ------------------------------------------------------------------------- */
/*                          Input processing (User)                          */
/* ------------------------------------------------------------------------- */

/* --------------------------------- LOGIN --------------------------------- */
function checkAccess(e) {
  event.preventDefault();

  let username = document.getElementById("uname").value;
  let password = document.getElementById("psw").value;

  if (username === "admin" && password === "1234") {
    /* -------------------- Update data, before viewing -------------------- */

    /* WEB GET VALUE FROM FIREBASE, update for "Timesheets" */
    updateTimeSheet();

    /* WEB GET VALUE FROM FIREBASE, update for "Open" */
    database.ref().on("value", function (snap) {
      let getFirebase = snap.val().Open;
      document.getElementById("now-open").innerHTML = "Now Open [" + convertValueToTime(getFirebase) + "]";
    });

    /* WEB GET VALUE FROM FIREBASE, update for "Close" */
    database.ref().on("value", function (snap) {
      let getFirebase = snap.val().Close;
      document.getElementById("now-close").innerHTML = "Now Close [" + convertValueToTime(getFirebase) + "]";
    });

    /* --------------------------------------------------------------------- */
    document.getElementById('access').style.display = "none";
  } else {
    alert("This account is not valid!\nPlease log in again.");
  }
}

/* ------------------------------- TIMESHEETS ------------------------------ */

function updateTimeSheet() {
  database.ref().child("ID").once("value", function (snap) {
    let total = snap.val().Total;

    total = Number(total);

    deleteOldTable();

    for (let locate = 1; locate <= total; locate++) {
      getDataforRow(locate);
    }
  });
}

/* ---------------------------------- NAME --------------------------------- */

function updateName(e) {
  event.preventDefault();

  let getName = document.getElementById("set-name").value;
  let getID = document.getElementById("set-id").value;

  let text = "Do you want to register ID [" + getID + "] with Name '" + getName + "'?";
  if (confirm(text) == true) {
    /* WEB SEND VALUE TO FIREBASE */
    let firebaseRef = firebase.database().ref().child("ID/" + getID);
    firebaseRef.set(getName);

    alert("Sign Up Success!");

    // Reload the table after adding a new entry
    updateTimeSheet();
  }
}

/* ---------------------------------- OPEN --------------------------------- */

function updateOpen(e) {
  event.preventDefault();

  let getOpen = document.getElementById("set-open").value;

  /* WEB SEND VALUE TO FIREBASE */
  let firebaseRef = firebase.database().ref().child("Open");
  firebaseRef.set(convertTimeToValue(getOpen));

  // Reload the table after updating the open time
  updateTimeSheet();
}

/* --------------------------------- CLOSE --------------------------------- */

function updateClose(e) {
  event.preventDefault();

  let getClose = document.getElementById("set-close").value;

  /* WEB SEND VALUE TO FIREBASE */
  let firebaseRef = firebase.database().ref().child("Close");
  firebaseRef.set(convertTimeToValue(getClose));

  // Reload the table after updating the close time
  updateTimeSheet();
}

/* ------------------------------------------------------------------------- */
/*                                  FUNCTION                                 */
/* ------------------------------------------------------------------------- */

function convertTimeToValue(data) {
  let ok = 3600 * data.substr(0, 2) + 60 * data.substr(3, 2);
  return ok.toString();
}

function convertValueToTime(data) {
  data = Number(data);
  data = data / 60;
  for (let h = 0; h <= 23; h++) {
    let m = data - 60 * h;
    if (m >= 0 && m <= 59) {
      return (
        (h < 10 ? "0" + h.toString() : h.toString()) +
        ":" +
        (m < 10 ? "0" + m.toString() : m.toString())
      );
    }
  }
}

/* ------------------------------------------------------------------------- */

function deleteOldTable() {
  let table = document.getElementById("timesheets");

  while (table.rows.length > 1) {
    table.deleteRow(1);
  }
}

function getDataforRow(locate) {
  let locateStr = "st" + locate;

  database.ref().child("ID/User/" + locateStr).once("value", function (snap) {
    let data = snap.val();

    let date = data.Date;
    let id = data.ID;
    let note = data.Note;
    let time = data.Time;

    database.ref().child("ID/" + id).once("value", function (snap) {
      let name = snap.val();

      createRowForTable(locate, name, id, date, time, note);
    });
  });
}

function createRowForTable(locate, name, id, date, time, note) {
  let table = document.getElementById("timesheets");
  let row = table.insertRow();

  let cell1 = row.insertCell(0);
  let cell2 = row.insertCell(1);
  let cell3 = row.insertCell(2);
  let cell4 = row.insertCell(3);
  let cell5 = row.insertCell(4);
  let cell6 = row.insertCell(5);

  cell1.innerHTML = locate;
  cell2.innerHTML = name;
  cell3.innerHTML = id;
  cell4.innerHTML = date;
  cell5.innerHTML = time;
  cell6.innerHTML = note;
}
function reloadTable() {
  updateTimeSheet();
}
