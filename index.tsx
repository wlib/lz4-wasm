import testData from './testData.json'
import { copyString, compress, compressString, decompressString } from './lz4'
import { baseline, bench, clear, group, run } from "tatami-ng"
import { UsersSchema } from './testDataZodSchema'
import Pbf from 'pbf'
import { writeUsers, readUsers } from './testDataGeneratedProtoInterface.mjs'

const jsonAsTypedArray = new TextEncoder().encode(JSON.stringify(testData))
const compressed = compress(jsonAsTypedArray)!
console.log(`compressed: ${compressed.size} decompressed: ${jsonAsTypedArray.byteLength} ratio: ${compressed.size / jsonAsTypedArray.byteLength}`)

group('round-trip', () => {
  baseline('json', () => {
    JSON.parse(JSON.stringify(testData))
  })

  bench('json with zod', () => {
    UsersSchema.parse(JSON.parse(JSON.stringify(testData)))
  })

  bench('protocol buffer', () => {
    const writePbf = new Pbf()
    writeUsers({ users: testData }, writePbf)
    const protocolBuffer = writePbf.finish()
    readUsers(new Pbf(protocolBuffer))
  })

  bench('json with lz4', () => {
    JSON.parse(decompressString(compressString(JSON.stringify(testData))!)!)
  })

  bench('string copy like lz4', () => {
    copyString(JSON.stringify(testData))
  })
})

group('write', () => {
  baseline('json', () => {
    JSON.stringify(testData)
  })

  bench('protocol buffer', () => {
    const writePbf = new Pbf()
    writeUsers({ users: testData }, writePbf)
    writePbf.finish()
  })

  bench('json with lz4', () => {
    compressString(JSON.stringify(testData))
  })
})

const json = JSON.stringify(testData)
const writePbf = new Pbf()
writeUsers({ users: testData }, writePbf)
const protocolBuffer = writePbf.finish()
const compressedJson = compressString(json)!

group('read', () => {
  baseline('json', () => {
    JSON.parse(json)
  })

  bench('json with zod', () => {
    UsersSchema.parse(JSON.parse(json))
  })

  bench('protocol buffer', () => {
    readUsers(new Pbf(protocolBuffer))
  })

  bench('json with lz4', () => {
    JSON.parse(decompressString(compressedJson)!)
  })
})


await run({ colors: true })

clear()
