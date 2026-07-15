import { config } from "../config/index.js";

export default function getRedisStatusChannel(){
    return `${config.ID}_domain`
}