import ensureIterable from './internal/ensure-iterable'
import { permutationsSize } from './internal/math'
import map from './map'
import range from './range'
import tee from './tee'
import product from './product'

export default function permutations (iterable, r) {
  const arr = Array.from(ensureIterable(iterable))
  const len = arr.length
  r = typeof r === 'undefined' ? len : r
  return {
    * [Symbol.iterator] () {
      if (r > len) return
      const mapToIndex = map((i) => arr[i])
      for (const indices of product(...tee(range(len), r))) {
        if (new Set(indices).size === r) {
          yield Array.from(mapToIndex(indices))
        }
      }
    },
    getSize () {
      return permutationsSize(len, r)
    }
  }
}
