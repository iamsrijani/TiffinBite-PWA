/**
 * Socket.io event handler setup.
 * Handles real-time communication for order status updates.
 */

/**
 * Initialize Socket.io event handlers.
 * @param {import('socket.io').Server} io - Socket.io server instance
 */
const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    /**
     * Join a user-specific room for targeted updates.
     * Client emits: socket.emit('joinRoom', { userId: '...' })
     */
    socket.on('joinRoom', ({ userId }) => {
      if (userId) {
        const room = `user_${userId}`;
        socket.join(room);
        console.log(`👤 Socket ${socket.id} joined room: ${room}`);
        socket.emit('roomJoined', { room, message: 'Successfully joined room.' });
      }
    });

    /**
     * Leave a user-specific room.
     * Client emits: socket.emit('leaveRoom', { userId: '...' })
     */
    socket.on('leaveRoom', ({ userId }) => {
      if (userId) {
        const room = `user_${userId}`;
        socket.leave(room);
        console.log(`👤 Socket ${socket.id} left room: ${room}`);
      }
    });

    /**
     * Handle order status update broadcasts.
     * This is typically emitted from the server side (controllers),
     * but can also be triggered by admin/delivery clients.
     */
    socket.on('orderStatusUpdate', (data) => {
      const { userId, orderId, status } = data;
      if (userId) {
        io.to(`user_${userId}`).emit('orderStatusUpdate', {
          orderId,
          status,
          updatedAt: new Date(),
        });
        console.log(`📦 Order ${orderId} status → ${status} (notified user_${userId})`);
      }
    });

    /**
     * Ping/pong for connection health check.
     */
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() });
    });

    /**
     * Handle disconnection.
     */
    socket.on('disconnect', (reason) => {
      console.log(`🔌 Socket disconnected: ${socket.id} (${reason})`);
    });
  });

  console.log('🔌 Socket.io initialized');
};

export default initSocket;
