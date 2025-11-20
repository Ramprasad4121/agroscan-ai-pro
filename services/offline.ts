
import { SyncQueueItem } from '../types';

const QUEUE_KEY = 'agroscan_sync_queue';

// Helper to simulate "Optimistic Updates"
export const offlineService = {
  // Get all pending items
  getQueue: (): SyncQueueItem[] => {
    if (typeof window === 'undefined') return [];
    const q = localStorage.getItem(QUEUE_KEY);
    return q ? JSON.parse(q) : [];
  },

  // Add a request to the queue
  addToQueue: (type: SyncQueueItem['type'], endpoint: string, data: any) => {
    const queue = offlineService.getQueue();
    const newItem: SyncQueueItem = {
      id: Date.now().toString(),
      type,
      endpoint,
      data,
      timestamp: Date.now(),
      status: 'pending'
    };
    queue.push(newItem);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    console.log(`[Offline] Added to queue: ${type}`);
    // Trigger a custom event so UI components can update
    window.dispatchEvent(new Event('sync-queue-updated'));
    return newItem;
  },

  // Clear processed items
  removeFromQueue: (id: string) => {
    const queue = offlineService.getQueue();
    const newQueue = queue.filter(item => item.id !== id);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(newQueue));
    window.dispatchEvent(new Event('sync-queue-updated'));
  },

  // Process the queue (Sync Engine)
  processQueue: async () => {
    const queue = offlineService.getQueue();
    if (queue.length === 0) return;

    console.log(`[Sync Engine] Processing ${queue.length} items...`);
    
    // In a real app, we would iterate and call the API here.
    // For this simulation, we just clear the queue after a delay and simulate success.
    
    for (const item of queue) {
      try {
        // Simulate network latency for upload
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log(`[Sync Engine] Synced item: ${item.type}`);
        offlineService.removeFromQueue(item.id);
      } catch (error) {
        console.error(`[Sync Engine] Failed to sync item ${item.id}`, error);
        // Keep in queue to retry later
      }
    }
  },

  getQueueCount: () => {
     return offlineService.getQueue().length;
  }
};
