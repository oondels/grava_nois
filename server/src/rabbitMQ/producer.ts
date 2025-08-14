import amqplib from "amqplib";

export async function publishClipCreated(channel: amqplib.Channel, payload: any) {
  const routingKey = 'clip.created.edge';
  const content = Buffer.from(JSON.stringify(payload));
  const ok = channel.publish('grn.clips', routingKey, content, {
    contentType: 'application/json',
    persistent: true,                         // grava em disco
    timestamp: Date.now(),
    correlationId: payload.clip_id,          // importante p/ tracing
    messageId: payload.clip_id,
  });

  if (!ok) console.warn('Channel buffer is full (publish returned false)');
}
