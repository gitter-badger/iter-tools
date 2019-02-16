/* eslint-env node, jest */
const { ensureIterable, isIterable } = require('../iterable')
const { range } = require('../..')

describe('ensureIterable', function () {
  it('works with iterables', function () {
    const i = range(3)
    expect(i).toBe(ensureIterable(i))
    expect(Array.from(ensureIterable(i))).toEqual([0, 1, 2])
  })
  it('works with Symbol.iterator', function () {
    const i = ensureIterable([0, 1, 2])
    expect(Array.from(i)).toEqual([0, 1, 2])
  })
  it('works with null', function () {
    const i = ensureIterable(null)
    expect(Array.from(i)).toEqual([])
  })
})

describe('isIterable', function () {
  it('works', function () {
    expect(isIterable(range(3))).toBe(true)
    expect(isIterable([])).toBe(true)
    expect(isIterable(null)).toBe(false)
  })
})
