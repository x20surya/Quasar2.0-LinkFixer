import ampq from 'amqplib/callback_api.js'
// Producer function
export default function enqueue(queue_name, data) {
    const rabbitURL = process.env.RABBITMQ_URL
    if (!rabbitURL) {
        // defined in docker-compose
        console.error("Fatal ERROR ::\nDestination : utils/scheduler/enqueue :: \nRABBITMQ_URL missing")
    }
    console.log(rabbitURL)
    ampq.connect(rabbitURL, (error0, connection) => {
        if (error0) {
            console.error("Fatal ERROR ::\nDestination : utils/scheduler/enqueue :: \n error0 trigerred")
            console.error(error0)
        }
        connection.createChannel((error1, channel) => {
            if (error1) {
                console.error("Fatal ERROR ::\nDestination : utils/scheduler/enqueue :: \n error1 trigerred")
                console.error(error1)
            }
            const queue = queue_name
            const msg = data
            try {
                channel.assertQueue(queue, {
                    durable: true
                })
                channel.sendToQueue(queue, Buffer.from(msg), {
                    persistent: true
                })
                console.log(`${msg} pushed to ${queue}`)
            } catch (err) {
                console.error("Error while enqueuing ::\nDestination : utils/scheduler/enqueue")
                console.error(err)
            }

        })
    })
}