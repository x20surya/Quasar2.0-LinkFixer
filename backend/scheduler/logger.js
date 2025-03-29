import { Website } from "../models/user.js"
import scraper from "../WebScaper/scraper.js"

let queue = []

export async function addToQueue(id) {
    try {
        const website = await Website.findById(id)
        if(website != null) queue.push(website)
    } catch (error) {
        console.log(error)
    }
}

export async function executeQueue() {
    for (const id of queue) {
        try {
            const website = await Website.findById(id);
            if (website == null) continue
            const startURL = website.startURL
            const data = await scraper({ startURL })
            const { visitedUrls, brokenLinks, checkedLinks, timeElapsed } = data
            website.brokenLinks = brokenLinks
            website.checkedAt = Date.now()
            website.checkedLinks = checkedLinks
            website.estimatedTime = (website.estimatedTime + timeElapsed) / 2
            website.save()
            console.log("Scheduled Execution of " + startURL)
        } catch (error) {
            console.log(error)
        }
    }
    console.log("Scheduled Execution complete")
}

export async function startupSeq(){
    const websites = await Website.find()
    for(const website of websites){
        queue.push(website)
    }
    executeQueue()
}

