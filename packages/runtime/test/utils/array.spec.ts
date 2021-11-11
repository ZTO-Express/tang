import { simpleCompare } from '../../src/utils'
import { sortArray, findRepeats } from '../../src/utils/helper'

describe('utils/array：数组相关操作', () => {
  it('数组排序，sortArray', () => {
    expect(sortArray([1, 2, -1, 3])).toEqual([-1, 1, 2, 3])
    expect(sortArray([1, 2, -1, 3], -1)).toEqual([3, 2, 1, -1])

    expect(sortArray([{ p1: 1, p2: 5 }, { p1: 2 }, { p2: 3 }, { p1: 1 }], 1, 'p1')).toEqual([
      { p1: 1, p2: 5 },
      { p1: 1 },
      { p1: 2 },
      { p2: 3 }
    ])
  })

  it('数组获取重复值，findRepeats', () => {
    expect(findRepeats([1, 2, -1, 3])).toEqual([])
    expect(findRepeats([1, 2, 1, 3])).toEqual([1])
    expect(findRepeats([1, 2, 3, '1'])).toEqual(['1'])

    expect(
      findRepeats([{ p1: 1, p2: 5 }, { p1: 2 }, { p2: 3 }, { p1: 1 }], (it1, it2) => {
        return simpleCompare(it1?.p1, it2?.p1)
      })
    ).toEqual([{ p1: 1 }])
  })
})
