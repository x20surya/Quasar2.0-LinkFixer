export type WebsiteQueueMessage = {
    id : string
    attempt : number
}

export type BrowserQueueMessage = {
    id : string
    failure : number
}