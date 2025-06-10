/**
 * Another simple JavaScript mutex implementation using promises.
 */
class Mutex {
  constructor() {
    this._locked = false;
    this._queue = [];
  }

  /**
   * Acquire the mutex lock
   * @returns {Promise<Function>} A promise that resolves to an unlock function
   */
  lock() {
    return new Promise((resolve) => {
      if (!this._locked) {
        this._locked = true;
        resolve(this._createUnlockFunction());
      } else {
        this._queue.push(() => {
          resolve(this._createUnlockFunction());
        });
      }
    });
  }

  /**
   * Creates an unlock function
   * that releases the mutex
   * @private
   * @returns {Function} The unlock function
   */
  _createUnlockFunction() {
    let unlocked = false;
    
    return () => {
      if (unlocked) {
        return;
      }
      
      unlocked = true;
      this._processQueue();
    };
  }

  /**
   * Process the next fn in the queue
   * @private
   */
  _processQueue() {
    if (this._queue.length > 0) {
      const next = this._queue.shift();
      setTimeout(() => next(), 0);
    } else {
      this._locked = false;
    }
  }
}

export { Mutex }; 
