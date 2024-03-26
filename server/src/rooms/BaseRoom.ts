import { Room, type Client } from "@colyseus/core";
import { BaseRoomSchema } from "./schema/BaseRoomSchema";

interface MessageObject {
    message: string;
    name: string;
}

export class BaseRoom extends Room<BaseRoomSchema> {
    maxClients = 4;

    onCreate(options: any) {
        this.setState(new BaseRoomSchema());

        this.onMessage("message", (client, message: MessageObject) => {
            //
            // handle "type" message
            //
            this.broadcast("message", message, { except: client });
        });

        this.onMessage("heartbeat", (client, message: number) => {
            // just reply back the message
            client.send("heartbeat", message);
        });
    }

    onJoin(client: Client, options: any) {
        console.log(client.sessionId, "joined!");
    }

    onLeave(client: Client, consented: boolean) {
        console.log(client.sessionId, "left!", consented);
    }

    onDispose() {
        console.log("room", this.roomId, "disposing...");
    }
}
