# Another Mutex

Another simple JavaScript mutex implementation using promises. Just lock() and unlock().

## Installation

```
npm install another-mutex
```

## Example

```
import { Mutex } from 'another-mutex';

const mtx = new Mutex();

// Basic lock/unlock pattern
mtx.lock().then((unlock) => {
  // Critical section - only one execution at a time
  console.log('Doing important work...');
  
  // Don't forget to unlock!
  unlock();

});
```

## Testing

```
npm test
```

## License

MIT
