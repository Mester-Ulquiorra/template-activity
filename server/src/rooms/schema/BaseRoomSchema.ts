import { Schema, type } from "@colyseus/schema";

export class BaseRoomSchema extends Schema {
    @type("string") mySynchronizedProperty = "Hello world";
}
