/*
==========================================================
 LoWorks Engine 0.1
 Browser-native hardware programming engine
==========================================================

 No external libraries.
 No CDN.
 No framework.

 The UI talks to this engine.

 The engine knows about:

 - Boards
 - GPIO
 - PWM
 - ADC
 - I2C
 - SPI
 - UART
 - Components
 - Programs
 - Intermediate Representation
 - Validation
 - Web Serial
==========================================================
*/


/* ======================================================
   LOWORKS ENGINE
====================================================== */

const LoWorks = {


    version: "0.1.0",


    /* ==================================================
       HARDWARE DATABASE
    ================================================== */

    boards: {


        pico2w: {

            id: "pico2w",

            name: "Raspberry Pi Pico 2 W",

            manufacturer: "Raspberry Pi",

            family: "RP2350",

            architecture: "ARM / RISC-V",

            language: "MicroPython",

            connection: "WebSerial",

            pins: {

                digital: [
                    0, 1, 2, 3, 4, 5,
                    6, 7, 8, 9, 10, 11,
                    12, 13, 14, 15, 16, 17,
                    18, 19, 20, 21, 22,
                    23, 24, 25, 26, 27, 28
                ],

                analog: [
                    "A0",
                    "A1",
                    "A2",
                    "A3"
                ]

            },

            capabilities: [
                "GPIO",
                "PWM",
                "ADC",
                "I2C",
                "SPI",
                "UART",
                "USB",
                "Wi-Fi",
                "Bluetooth"
            ]

        },


        unoR4WiFi: {

            id: "unoR4WiFi",

            name: "Arduino UNO R4 WiFi",

            manufacturer: "Arduino",

            family: "RA4M1",

            architecture: "ARM Cortex-M4",

            language: "Arduino C++",

            connection: "WebSerial",

            pins: {

                digital: [
                    0, 1, 2, 3, 4, 5,
                    6, 7, 8, 9, 10, 11,
                    12, 13
                ],

                analog: [
                    "A0",
                    "A1",
                    "A2",
                    "A3",
                    "A4",
                    "A5"
                ]

            },

            capabilities: [
                "GPIO",
                "PWM",
                "ADC",
                "I2C",
                "SPI",
                "UART",
                "USB",
                "Wi-Fi",
                "Bluetooth"
            ]

        }

    },


    /* ==================================================
       COMPONENT LIBRARY
    ================================================== */

    components: {


        led: {

            id: "led",

            name: "LED",

            icon: "💡",

            description:
                "A light that LoWorks can control.",

            pinsRequired: 1,

            capabilities: [
                "digital-output",
                "pwm"
            ]

        },


        button: {

            id: "button",

            name: "Button",

            icon: "🔘",

            description:
                "A button LoWorks can detect.",

            pinsRequired: 1,

            capabilities: [
                "digital-input"
            ]

        },


        buzzer: {

            id: "buzzer",

            name: "Buzzer",

            icon: "🔊",

            description:
                "A small speaker for sounds.",

            pinsRequired: 1,

            capabilities: [
                "digital-output",
                "pwm"
            ]

        },


        potentiometer: {

            id: "potentiometer",

            name: "Potentiometer",

            icon: "🎛️",

            description:
                "A knob LoWorks can read.",

            pinsRequired: 1,

            capabilities: [
                "analog-input"
            ]

        }

    },


    /* ==================================================
       PROGRAM LANGUAGE
    ================================================== */

    language: {


        events: {

            START: {
                type: "event",
                name: "When Start"
            }

        },


        actions: {

            SET: {
                type: "action",
                name: "Set"
            },

            WAIT: {
                type: "action",
                name: "Wait"
            },

            DIGITAL_WRITE: {
                type: "action",
                name: "Digital Write"
            },

            ANALOG_READ: {
                type: "action",
                name: "Analog Read"
            },

            PWM: {
                type: "action",
                name: "PWM"
            }

        },


        control: {

            IF: {
                type: "control",
                name: "If"
            },

            ELSE: {
                type: "control",
                name: "Else"
            },

            REPEAT: {
                type: "control",
                name: "Repeat"
            },

            WHILE: {
                type: "control",
                name: "While"
            }

        }

    },


    /* ==================================================
       CURRENT PROJECT
    ================================================== */

    project: {

        board: null,

        components: [],

        program: {

            events: [],

            actions: []

        }

    },


    /* ==================================================
       SERIAL CONNECTION
    ================================================== */

    serial: {

        port: null,

        writer: null,

        reader: null,

        connected: false,

        buffer: "",

        async connect() {

            if (!("serial" in navigator)) {

                throw new Error(
                    "Web Serial is not supported by this browser."
                );

            }


            this.port =
                await navigator.serial.requestPort();


            await this.port.open({
                baudRate: 115200
            });


            this.writer =
                this.port.writable.getWriter();


            this.connected = true;


            this.read();

            await this.send("LOWORKS HELLO");

        },


        async send(command) {

            if (!this.writer) {

                throw new Error(
                    "No hardware is connected."
                );

            }


            const bytes =
                new TextEncoder().encode(
                    command + "\n"
                );


            await this.writer.write(bytes);


            LoWorks.log(
                "→ " + command
            );

        },


        async read() {

            if (!this.port?.readable) {
                return;
            }


            this.reader =
                this.port.readable.getReader();


            try {

                while (true) {

                    const result =
                        await this.reader.read();


                    if (result.done) {
                        break;
                    }


                    const text =
                        new TextDecoder().decode(
                            result.value
                        );


                    this.buffer += text;


                    const lines =
                        this.buffer.split("\n");


                    this.buffer =
                        lines.pop();


                    for (const line of lines) {

                        const message =
                            line.trim();


                        if (message) {

                            LoWorks.handleSerialMessage(
                                message
                            );

                        }

                    }

                }

            } catch (error) {

                console.error(error);

            } finally {

                this.reader.releaseLock();

                this.reader = null;

            }

        }

    },


    /* ==================================================
       SERIAL MESSAGE HANDLER
    ================================================== */

    handleSerialMessage(message) {

        LoWorks.log(
            "← " + message
        );


        if (
            message.includes("PICO") ||
            message.includes("RP2350")
        ) {

            this.detectBoard("pico2w");

        }


        if (
            message.includes("UNO") ||
            message.includes("RA4M1")
        ) {

            this.detectBoard("unoR4WiFi");

        }

    },


    /* ==================================================
       BOARD DETECTION
    ================================================== */

    detectBoard(boardId) {

        const board =
            this.boards[boardId];


        if (!board) {
            return;
        }


        this.project.board =
            board;


        document.getElementById(
            "boardName"
        ).textContent =
            board.name;


        document.getElementById(
            "boardDetails"
        ).textContent =
            board.manufacturer +
            " · " +
            board.family;


        document.getElementById(
            "engineDot"
        ).classList.add(
            "connected"
        );


        this.renderCapabilities();


        this.log(
            "Detected " +
            board.name
        );

    },


    /* ==================================================
       COMPONENT CREATION
    ================================================== */

    addComponent(
        type,
        pin
    ) {

        const definition =
            this.components[type];


        if (!definition) {

            throw new Error(
                "Unknown component: " +
                type
            );

        }


        const component = {

            id:
                type +
                "_" +
                (this.project.components.length + 1),

            type: type,

            name: definition.name,

            pin: pin,

            capabilities:
                definition.capabilities

        };


        this.project.components.push(
            component
        );


        this.log(
            "Added " +
            definition.name +
            " on pin " +
            pin
        );


        this.renderComponents();


        return component;

    },


    /* ==================================================
       PROGRAM BUILDER
    ================================================== */

    createProgram() {

        return {

            events: [
                {
                    type: "event",
                    event: "START"
                }
            ],

            actions: [

                {
                    type: "set",
                    target: "led_1",
                    property: "state",
                    value: true
                },

                {
                    type: "wait",
                    milliseconds: 500
                },

                {
                    type: "set",
                    target: "led_1",
                    property: "state",
                    value: false
                }

            ]

        };

    },


    /* ==================================================
       EASY LANGUAGE TRANSLATOR
    ================================================== */

    translateAction(action) {

        if (action.type === "wait") {

            if (
                action.milliseconds === 500
            ) {

                return "WAIT → 1/2 SECOND";

            }


            return (
                "WAIT → " +
                action.milliseconds +
                " ms"
            );

        }


        if (action.type === "set") {

            const component =
                this.project.components.find(
                    item =>
                        item.id === action.target
                );


            if (!component) {

                return "SET UNKNOWN COMPONENT";

            }


            if (component.type === "led") {

                return (
                    "SET LED → " +
                    (
                        action.value
                            ? "ON"
                            : "OFF"
                    )
                );

            }

        }


        return "UNKNOWN ACTION";

    },


    /* ==================================================
       TECHNICAL TRANSLATOR
    ================================================== */

    toTechnical(action) {

        const component =
            this.project.components.find(
                item =>
                    item.id === action.target
            );


        if (
            action.type === "wait"
        ) {

            return (
                "delay(" +
                action.milliseconds +
                ");"
            );

        }


        if (
            action.type === "set" &&
            component
        ) {

            if (
                component.type === "led"
            ) {

                return (
                    "digitalWrite(" +
                    component.pin +
                    ", " +
                    (
                        action.value
                            ? "HIGH"
                            : "LOW"
                    ) +
                    ");"
                );

            }

        }


        return "// unsupported instruction";

    },


    /* ==================================================
       VALIDATOR
    ================================================== */

    validate() {

        const errors = [];


        if (!this.project.board) {

            errors.push(
                "No hardware board is connected."
            );

        }


        for (
            const component
            of this.project.components
        ) {

            if (
                component.pin === undefined ||
                component.pin === null
            ) {

                errors.push(
                    component.name +
                    " does not have a pin."
                );

            }

        }


        for (
            const action
            of this.project.program.actions
        ) {

            if (
                action.type === "set"
            ) {

                const component =
                    this.project.components.find(
                        item =>
                            item.id === action.target
                    );


                if (!component) {

                    errors.push(
                        "A program action references " +
                        "a missing component."
                    );

                }

            }

        }


        return errors;

    },


    /* ==================================================
       RUN PROGRAM
    ================================================== */

    async run() {

        const errors =
            this.validate();


        if (errors.length) {

            errors.forEach(
                error =>
                    this.log(
                        "ERROR: " + error,
                        true
                    )
            );

            return;

        }


        if (
            !this.serial.connected
        ) {

            this.log(
                "Hardware is not connected.",
                true
            );

            return;

        }


        this.log(
            "Starting program..."
        );


        for (
            const action
            of this.project.program.actions
        ) {

            const command =
                this.actionToCommand(
                    action
                );


            if (!command) {
                continue;
            }


            await this.serial.send(
                command
            );


            if (
                action.type === "wait"
            ) {

                await new Promise(
                    resolve =>
                        setTimeout(
                            resolve,
                            action.milliseconds
                        )
                );

            }

        }


        this.log(
            "Program finished."
        );

    },


    /* ==================================================
       COMMAND COMPILER
    ================================================== */

    actionToCommand(action) {

        const component =
            this.project.components.find(
                item =>
                    item.id === action.target
            );


        if (
            action.type === "wait"
        ) {

            return (
                "WAIT " +
                action.milliseconds
            );

        }


        if (
            action.type === "set" &&
            component
        ) {

            if (
                component.type === "led"
            ) {

                return (
                    "GPIO " +
                    component.pin +
                    " " +
                    (
                        action.value
                            ? "HIGH"
                            : "LOW"
                    )
                );

            }

        }


        return null;

    },


    /* ==================================================
       RENDER CAPABILITIES
    ================================================== */

    renderCapabilities() {

        const element =
            document.getElementById(
                "capabilityList"
            );


        element.innerHTML = "";


        if (!this.project.board) {

            element.textContent =
                "Connect a board to inspect it.";

            return;

        }


        for (
            const capability
            of this.project.board.capabilities
        ) {

            const tag =
                document.createElement("div");


            tag.className =
                "capability";


            tag.textContent =
                capability;


            element.appendChild(tag);

        }

    },


    /* ==================================================
       RENDER COMPONENTS
    ================================================== */

    renderComponents() {

        const element =
            document.getElementById(
                "componentList"
            );


        element.innerHTML = "";


        for (
            const component
            of this.project.components
        ) {

            const definition =
                this.components[
                    component.type
                ];


            const card =
                document.createElement("div");


            card.className =
                "component";


            card.innerHTML = `

                <div class="component-icon">
                    ${definition.icon}
                </div>

                <strong>
                    ${definition.name}
                </strong>

                <span>
                    Pin ${component.pin}
                </span>

            `;


            element.appendChild(card);

        }

    },


    /* ==================================================
       RENDER PROGRAM
    ================================================== */

    renderProgram() {

        const element =
            document.getElementById(
                "programView"
            );


        element.innerHTML = "";


        const start =
            document.createElement("div");


        start.className =
            "program-block start";


        start.textContent =
            "WHEN START";


        element.appendChild(start);


        const actions =
            this.project.program.actions;


        actions.forEach(
            action => {

                const arrow =
                    document.createElement("div");


                arrow.className =
                    "program-arrow";


                arrow.textContent =
                    "↓";


                element.appendChild(
                    arrow
                );


                const block =
                    document.createElement("div");


                let className =
                    "program-block";


                if (
                    action.type === "wait"
                ) {

                    className +=
                        " wait";

                }

                else if (
                    action.type === "set"
                ) {

                    const component =
                        this.project.components.find(
                            item =>
                                item.id === action.target
                        );


                    if (
                        component?.type === "led"
                    ) {

                        className +=
                            action.value
                                ? " led"
                                : " off";

                    }

                }


                block.className =
                    className;


                block.textContent =
                    this.translateAction(
                        action
                    );


                element.appendChild(
                    block
                );

            }
        );

    },


    /* ==================================================
       RENDER ADVANCED REPRESENTATION
    ================================================== */

    renderAdvanced() {

        const element =
            document.getElementById(
                "advancedView"
            );


        let output =
            "// LoWorks Advanced Representation\n\n";


        if (!this.project.board) {

            output +=
                "// No board selected\n";

        }

        else {

            output +=
                "// Board: " +
                this.project.board.name +
                "\n\n";

        }


        for (
            const component
            of this.project.components
        ) {

            output +=
                `const ${component.id}_PIN = ${component.pin};\n`;

        }


        output += "\n";


        output +=
            "void setup() {\n";


        for (
            const event
            of this.project.program.events
        ) {

            if (
                event.event === "START"
            ) {

                output +=
                    "    // WHEN START\n";

            }

        }


        output +=
            "}\n\n";


        output +=
            "void loop() {\n";


        for (
            const action
            of this.project.program.actions
        ) {

            output +=
                "    " +
                this.toTechnical(
                    action
                ) +
                "\n";

        }


        output +=
            "}\n";


        element.textContent =
            output;

    },


    /* ==================================================
       LOGGING
    ================================================== */

    log(
        message,
        error = false
    ) {

        const consoleBox =
            document.getElementById(
                "console"
            );


        const line =
            document.createElement(
                "div"
            );


        line.className =
            "console-line " +
            (
                error
                    ? "error"
                    : "good"
            );


        line.textContent =
            message;


        consoleBox.appendChild(
            line
        );


        consoleBox.scrollTop =
            consoleBox.scrollHeight;

    }

};


/* ======================================================
   STARTUP
====================================================== */

function initializeLoWorks() {

    LoWorks.project.program =
        LoWorks.createProgram();


    /*
       For Prototype 01 we give the engine
       a default example component.

       Later this will come from the
       actual hardware/component setup.
    */

    LoWorks.addComponent(
        "led",
        13
    );


    LoWorks.renderProgram();

    LoWorks.renderAdvanced();


    LoWorks.log(
        "LoWorks Engine 0.1 initialized."
    );


    LoWorks.log(
        "Hardware library loaded."
    );


    LoWorks.log(
        "Pico 2 W + UNO R4 WiFi definitions loaded."
    );

}


/* ======================================================
   UI EVENTS
====================================================== */

document
    .getElementById("connectButton")
    .addEventListener(
        "click",
        async () => {

            try {

                LoWorks.log(
                    "Opening Web Serial..."
                );


                await LoWorks.serial.connect();


                LoWorks.log(
                    "Waiting for board identification..."
                );

            }

            catch (error) {

                LoWorks.log(
                    error.message,
                    true
                );

            }

        }
    );


document
    .getElementById("validateButton")
    .addEventListener(
        "click",
        () => {

            const errors =
                LoWorks.validate();


            if (!errors.length) {

                LoWorks.log(
                    "Program is valid."
                );

            }

            else {

                errors.forEach(
                    error =>
                        LoWorks.log(
                            error,
                            true
                        )
                );

            }

        }
    );


document
    .getElementById("runButton")
    .addEventListener(
        "click",
        () => {

            LoWorks.run();

        }
    );


document
    .getElementById("stopButton")
    .addEventListener(
        "click",
        async () => {

            try {

                await LoWorks.serial.send(
                    "STOP"
                );


                LoWorks.log(
                    "Program stopped."
                );

            }

            catch (error) {

                LoWorks.log(
                    error.message,
                    true
                );

            }

        }
    );


/* ======================================================
   INITIALIZE
====================================================== */

window.addEventListener(
    "DOMContentLoaded",
    initializeLoWorks
);
