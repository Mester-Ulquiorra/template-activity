import { DiscordSDK, Colyseus } from "./bundle";
import config from "../../config";

const messageBox = document.getElementById("message") as HTMLTextAreaElement;
const sendButton = document.getElementById("send") as HTMLButtonElement;
const text = document.getElementById("text") as HTMLHeadingElement;

const clientID = config.CLIENT_ID;
const discordSDK = new DiscordSDK(clientID);
const user = await setupDiscordSdk();

const colyClient = new Colyseus.Client(`wss://${location.host}/mp`);
const room = await colyClient.joinOrCreate("base_room").then((room) => {
    // listen for new messages
    room.onMessage("message", (message) => {
        addMessage(message.message, message.name);
    });

    room.onMessage("heartbeat", () => {
        // literally do nothing
    });

    // automatic keep alive
    setInterval(() => {
        room.send("heartbeat", 0);
    }, 5000);

    return room;
});

async function setupDiscordSdk() {
    await discordSDK.ready();
    console.log("Discord SDK is ready!");

    const { code } = await discordSDK.commands.authorize({
        client_id: clientID,
        response_type: "code",
        state: "",
        prompt: "none",
        scope: ["identify", "guilds"],
    });

    const response = await fetch(`/api/auth/get-activity-token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            code,
        }),
    });
    const { access_token } = await response.json();

    return discordSDK.commands.authenticate({ access_token });
}

function addMessage(message: string, name: string) {
    const messageElement = document.createElement("p");
    messageElement.innerText = `${name}: ${message}`;
    document.body.appendChild(messageElement);
}

sendButton.addEventListener("click", () => {
    const message = messageBox.value;

    room.send("message", { message, name: user.user.username });

    addMessage(message, user.user.username);
    messageBox.value = "";
});
