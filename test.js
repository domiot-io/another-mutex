import { test, describe } from 'node:test';
import { strict as assert } from 'node:assert';
import { Mutex } from './index.js';

describe('Mutex', () => {
  
  test('should acquire lock and provide unlock function', () => {
    const mutex = new Mutex();
    return mutex.lock().then((unlock) => {
      assert.strictEqual(typeof unlock, 'function');
      unlock();
    });
  });

  test('should handle multiple unlock calls safely', () => {
    const mutex = new Mutex();
    return mutex.lock().then((unlock) => {
      assert.doesNotThrow(() => {
        unlock();
        unlock();
        unlock();
      });
    });
  });

  test('should serialize access to critical section', () => {
    const mutex = new Mutex();
    const results = [];
    
    const task = (id, delay) => {
      return mutex.lock().then((unlock) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            results.push(id);
            unlock();
            resolve(id);
          }, delay);
        });
      });
    };

    const promises = [
      task('A', 50),
      task('B', 30),
      task('C', 10)
    ];

    return Promise.all(promises).then(() => {
      assert.deepStrictEqual(results, ['A', 'B', 'C']);
    });
  });

  test('should queue lock requests when mutex is busy', () => {
    const mutex = new Mutex();
    const results = [];
    let firstLockAcquired = false;
    
    return mutex.lock().then((firstUnlock) => {
      // Queue up several lock requests
      const promises = [];
      for (let i = 1; i <= 3; i++) {
        promises.push(
          mutex.lock().then((unlock) => {
            results.push(i);
            unlock();
            return i;
          })
        );
      }
      
      // Release first lock after a delay
      setTimeout(() => {
        firstLockAcquired = true;
        firstUnlock();
      }, 50);
      
      return Promise.all(promises).then(() => {
        assert.ok(firstLockAcquired);
        assert.deepStrictEqual(results, [1, 2, 3]);
      });
    });
  });

  test('should handle rapid lock/unlock cycles', () => {
    const mutex = new Mutex();
    const results = [];
    
    const quickTask = (id) => {
      return mutex.lock().then((unlock) => {
        results.push(id);
        unlock();
      });
    };
    
    const promises = [];
    for (let i = 0; i < 10; i++) {
      promises.push(quickTask(i));
    }
    
    return Promise.all(promises).then(() => {
      // Should have all results
      assert.strictEqual(results.length, 10);
      // Should be sequential (0, 1, 2, ..., 9)
      assert.deepStrictEqual(results, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });
  });

}); 
