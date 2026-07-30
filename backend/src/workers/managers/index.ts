import { sleep } from "../../utils/sleep.js";
import { Manager } from "./Manager.js";

/**
 * Queues Used :---
 * 
 * priority_low_domain / priority_mid_domain / priority_high_domain : 
 * stores : website domains 
 * format : message : {
 *              id : uid for the website in mongo
 *              attempt : number of tries given to current website, max 3
 *          }
 * 
 * 
 * <domain>_links :
 * stores : internal and external links of domains currently being processed
 * format : link : {
 *              link : string,
 *              depth : smallest diff from a sitemap link         
 *          }
 * 
 * 
 * available_browsers : 
 * stores : stores links of puppeteer browser instances currently idle
 * format : browser : {
 *              id : unique
 *              failure
 *          }
 */

/**  Redis -> 
 * 
 *  queued:${websiteID}
 *      VALUE : 0 -> stop execution 1 -> continue execution
 *      status of website queue
 *  
 *  <website_id>_active_browsers
 *      VALUE :: number
 *      number of browsers currently working on a website_id
 * 
 *  SERVICES:DOWN
 *      1 -> all services down, no scraper available
 * 
 *  reports
 *      value -> as needed by coder for admin portal
 *  
 *  
*/

await sleep(15000)

const manager = await Manager.init()
manager.startWebsiteProcessing()
