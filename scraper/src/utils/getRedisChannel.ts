import { config } from "../config/index.js"

export default function getRedisChannel() {
    return `${config.ID}_domain`
}

export function getRedisCheckedLinksKey(domain : string){
    return `${domain}_checkedLinks`
}

export function getRedisPauseStatusKey(domain : string){
    return `${domain}_pause_status`
}

export function getRedisResultKey(domain : string){
    return `${domain}_results`
}

export function getRedisHealthKey(){
    return `${config.ID}_status`
}