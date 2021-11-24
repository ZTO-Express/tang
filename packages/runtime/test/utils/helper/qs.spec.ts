import { qsstringify } from '../../../src/utils/helper'

describe('helper/querystring：querystring处理', () => {
  it('stringify naturalCompare', () => {
    let qrystr1 = qsstringify(
      {
        name: 1,
        1: 'x',
        test: true
      },
      {
        sort: (a, b) => a.localeCompare(b)
      }
    )
    let qrystr2 = qsstringify(
      {
        1: 'x',
        test: true,
        name: 1
      },
      {
        sort: (a, b) => a.localeCompare(b)
      }
    )
    expect(qrystr1).toBe('1=x&name=1&test=true')
    expect(qrystr1).toBe(qrystr2)
  })
})
