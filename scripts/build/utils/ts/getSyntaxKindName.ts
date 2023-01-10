import { SyntaxKind } from 'ts-morph'

// some SyntaxKinds are repeated, so only use the first one
const __kindNames = Object.keys(SyntaxKind)
  .filter(k => isNaN(parseInt(k, 10)))
  .reduce((col: { [kind: number]: string }, k: string) => {
    const value = (SyntaxKind as any)[k] as number

    if (col[value] == null) col[value] = k

    return col
  }, {})

/** 获取预发KindName */
export function getSyntaxKindName(kind: SyntaxKind) {
  return __kindNames[kind]
}
