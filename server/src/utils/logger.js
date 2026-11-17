import { ActivityLog } from '../models/ActivityLog.js';
import { getIO } from '../sockets/socketManager.js';

export const logActivity = async ({
  actorId = null,
  actorName = 'System',
  action,
  entityType,
  entityId = null,
  details = {},
}) => {
  try {
    const log = await ActivityLog.create({
      actorId,
      actorName,
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date(),
    });

    try {
      const io = getIO();
      if (io) {
        io.emit('activity_logged', log);
      }
    } catch (socketErr) {
      // socket might not be initialized during initial startup/scripts
    }

    return log;
  } catch (err) {
    console.error('[ActivityLog] Failed to log activity:', err.message);
    return null;
  }
};
