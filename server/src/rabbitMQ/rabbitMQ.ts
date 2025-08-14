import amqp from "amqplib"

const setupRabbit = async () => {
  try {
    const connection = await amqp.connect('amqp://localhost')

    const channel = await connection.createChannel()

    await channel.assertExchange("grn.videos", "topic", { durable: true })
    // DLX/ DLQ
    await channel.assertQueue("grn.videos.ingest.dlq", { durable: true })
    // Queue principal
    await channel.assertQueue("grn.videos.ingest", {
      durable: true,
      arguments: {
        "x-dead-letter-exchange": "",
        "x-dead-letter-routing-key": "grn.videos.ingest.dlq"
      }
    })

    // Binding
    await channel.bindQueue("grn.videos.ingest", "grn.videos", "video.created.*")

    channel.prefetch(8)

    return { connection, channel }
  } catch (error) {
    console.error("Error connecting to RabbitMQ:", error);
  }
}