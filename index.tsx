import testData from './testData.json'
import { compress, compressString, decompressString, copy } from './lz4'
import { baseline, bench, clear, group, run } from "tatami-ng"

const jsonAsTypedArray = new TextEncoder().encode(JSON.stringify(testData))
const compressed = compress(jsonAsTypedArray)!
console.log(`compressed: ${compressed.byteLength} decompressed: ${jsonAsTypedArray.byteLength} ratio: ${compressed.byteLength / jsonAsTypedArray.byteLength}`)

group('lz4', () => {
  baseline('baseline', () => {})

  bench('round-trip json without lz4', () => {
    JSON.parse(JSON.stringify(testData))
  })

  bench('round-trip json with lz4', () => {
    JSON.parse(decompressString(compressString(JSON.stringify(testData))!))
  })

  bench('round-trip memory transfer like lz4', () => {
    copy(jsonAsTypedArray)
    copy(compressed)
  })
})

await run({ colors: true })

clear()
