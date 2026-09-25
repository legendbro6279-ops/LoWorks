```javascript
/* =========================================================
   LoWorks — Prototype 01
   Browser-side application logic
========================================================= */


let port = null;
let writer = null;


/* =========================================================
   ELEMENTS
========================================================= */

const connectButton =
    document.getElementById("connectButton");

const runButton =
    document.getElementById("runButton");

const stopButton =
    document.getElementById("stopButton");

const statusText =
    document.getElementById("statusText");

const statusDot =
    document.getElementById("statusDot");

const consoleBox =
    document.getElementById("console");

const workspace =
    document.getElementById("workspace");

const blocks =
    document.querySelectorAll(".block");


/* =========================================================
   CONSOLE
========================================================= */

function log(message) {

    consoleBox.innerHTML = "";

    const dot =
        document.createElement("span");

    dot.className = "console-dot";

    consoleBox.appendChild(dot);

    consoleBox.appendChild(
        document.createTextNode(message)
    );

}


/* =========================================================
   CONNECTION
========================================================= */

async function connectArduino() {

    if (!("serial" in navigator)) {

        log(
            "Web Serial is not available in this browser."
        );

        return;
    }


    try {

        log(
            "Choose your Arduino from the device list..."
        );


        port =
            await navigator.serial.requestPort();


        await port.open({
            baudRate: 115200
        });


        writer =
            port.writable.getWriter();


        statusText.textContent =
            "Connected";


        statusDot.classList.add(
            "connected"
        );


        connectButton.textContent =
            "Arduino Connected";


        log(
            "Arduino connected.\n\n" +
            "LoWorks is ready."
        );

    }


    catch (error) {

        console.error(error);


        log(
            "Connection failed.\n\n" +
            error.message
        );

    }

}


/* =========================================================
   SERIAL COMMAND
========================================================= */

async function sendCommand(command) {

    if (!writer) {

        log(
            "Connect your Arduino first."
        );

        return false;
    }


    try {

        const data =
            new TextEncoder().encode(
                command + "\n"
            );


        await writer.write(data);


        return true;

    }


    catch (error) {

        console.error(error);


        log(
            "Could not send command.\n\n" +
            error.message
        );


        return false;

    }

}


/* =========================================================
   RUN
========================================================= */

async function runProgram() {

    if (!writer) {

        log(
            "Connect your Arduino first."
        );

        return;
    }


    log(
        "Running LoWorks program..."
    );


    await sendCommand("RUN");

}


/* =========================================================
   STOP
========================================================= */

async function stopProgram() {

    if (!writer) {

        return;
    }


    await sendCommand("STOP");


    log(
        "Program stopped."
    );

}


/* =========================================================
   BUTTON EVENTS
========================================================= */

connectButton.addEventListener(
    "click",
    connectArduino
);


runButton.addEventListener(
    "click",
    runProgram
);


stopButton.addEventListener(
    "click",
    stopProgram
);


/* =========================================================
   BLOCK DRAGGING
========================================================= */

blocks.forEach(block => {


    block.addEventListener(
        "dragstart",
        event => {

            const command =
                block.dataset.command;


            event.dataTransfer.setData(
                "text/plain",
                command
            );


            workspace.classList.add(
                "drag-active"
            );

        }
    );


    block.addEventListener(
        "dragend",
        () => {

            workspace.classList.remove(
                "drag-active"
            );

        }
    );

});


/* =========================================================
   WORKSPACE DROP
========================================================= */

workspace.addEventListener(
    "dragover",
    event => {

        event.preventDefault();

    }
);


workspace.addEventListener(
    "drop",
    event => {

        event.preventDefault();


        workspace.classList.remove(
            "drag-active"
        );


        const command =
            event.dataTransfer.getData(
                "text/plain"
            );


        if (!command) {

            return;
        }


        log(
            "Selected block:\n" +
            command
        );

    }
);


/* =========================================================
   STARTUP
========================================================= */

log(
    "LoWorks is ready."
);
```

