import ampq from 'amqplib'
// Producer function


const rabbitURL = process.env.RABBITMQ_URL
if (!rabbitURL) {
    // defined in docker-compose
    console.error("Fatal ERROR ::\nDestination : utils/scheduler/enqueue :: \nRABBITMQ_URL missing")
    process.exit(1)
}
let channel, connection
try {
    connection = await ampq.connect(rabbitURL)
    channel = await connection.createChannel()
} catch (err) {
    console.log(`Error in connecting to rabbitMQ`)
}


export default async function enqueue(queue_name, data) {
    const queue = queue_name
    const msg = data
    try {
        await channel.assertQueue(queue, {
            durable: true
        })
        await channel.sendToQueue(queue, Buffer.from(msg), {
            persistent: true
        })
        console.log(`${msg} pushed to ${queue}`)
    } catch (err) {
        console.error("Error while enqueuing ::\nDestination : utils/scheduler/enqueue")
        console.error(err)
    }
}