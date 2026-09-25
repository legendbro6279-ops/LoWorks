```javascript
/* =========================================
   LoWorks — Prototype 01
========================================= */


let port = null;
let writer = null;


/* =========================================
   ELEMENTS
========================================= */

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


/* =========================================
   CONSOLE
========================================= */

function log(message) {

    consoleBox.innerHTML = "";

    const dot =
        document.createElement("span");

    dot.className =
        "console-dot";

    consoleBox.appendChild(dot);

    consoleBox.appendChild(
        document.createTextNode(message)
    );

}


/* =========================================
   CONNECT
========================================= */

async function connectArduino() {

    if (!("serial" in navigator)) {

        log(
            "Web Serial is not available in this browser."
        );

        return;
    }


    try {

        log(
            "Choose your Arduino..."
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


/* =========================================
   SERIAL
========================================= */

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


/* =========================================
   RUN
========================================= */

async function runProgram() {

    if (!writer) {

        log(
            "Connect your Arduino first."
        );

        return;
    }


    runButton.style.transform =
        "scale(.97)";


    setTimeout(() => {

        runButton.style.transform =
            "";

    }, 130);


    log(
        "Running LoWorks program..."
    );


    await sendCommand("RUN");

}


/* =========================================
   STOP
========================================= */

async function stopProgram() {

    if (!writer) {

        return;
    }


    await sendCommand("STOP");


    log(
        "Program stopped."
    );

}


/* =========================================
   BUTTONS
========================================= */

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


/* =========================================
   BLOCK DRAGGING
========================================= */

blocks.forEach(block => {

    block.addEventListener(
        "dragstart",
        event => {

            event.dataTransfer.setData(
                "text/plain",
                block.dataset.command
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


/* =========================================
   DROP AREA
========================================= */

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
            "Block selected:\n" +
            command
        );

    }
);


/* =========================================
   PAGE LOAD
========================================= */

window.addEventListener(
    "load",
    () => {

        setTimeout(() => {

            log(
                "LoWorks is ready."
            );

        }, 700);

    }
);
```
