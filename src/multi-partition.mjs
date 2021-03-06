import { Queue, fakeQueue } from './internal/queues'
import { iterableCurry } from './internal/iterable'

function * multiPartition (func, iter) {
  const queues = []
  let maxQueues = Infinity
  let queueNumber = 0
  const iterator = iter[Symbol.iterator]()
  let exhausted = 0

  function returnIterator () {
    if (exhausted === maxQueues) {
      if (typeof iterator.return === 'function') iterator.return()
    }
  }

  function * part (queueId) {
    yield 'ensure finally'
    queues[queueId] = queues[queueId] || new Queue()
    try {
      while (true) {
        while (!queues[queueId].isEmpty()) {
          yield queues[queueId].shift()
        }

        const { value, done } = iterator.next()
        if (done) break

        const chosen = func(value)
        if (chosen < maxQueues) { // throw away item if queue doesn't exist
          queues[chosen] = queues[chosen] || new Queue()
          queues[chosen].push(value)
        }
      }
    } finally {
      queues[queueId] = fakeQueue // /dev/null
      exhausted++
      returnIterator()
    }
  }

  try {
    while (true) {
      const iter = part(queueNumber++)
      iter.next() // ensure finally
      yield iter
    }
  } finally {
    // I trim the number of queues
    queues.length = maxQueues = queueNumber
    returnIterator()
  }
}

export default iterableCurry(multiPartition)
