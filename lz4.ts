import { makeAllocationClass } from "./allocation"

const lz4 = await WebAssembly.instantiateStreaming(
  fetch("./zig-out/bin/lz4.wasm"),
  {
    env: {
    }
  }
)

const lz4Exports = lz4.instance.exports as {
  memory: WebAssembly.Memory
  malloc: (size: number) => number
  resize: (pointer: number, size: number) => boolean
  free: (pointer: number) => void
  compress: (inputPointer: number, inputLength: number, outputPointer: number, outputLength: number) => number
  decompress: (inputPointer: number, inputLength: number, outputPointer: number, outputLength: number) => number
}

class Allocation extends makeAllocationClass(lz4Exports) {}

// const cloneArray = (input: Uint8Array) => {
//   const clone = new Uint8Array(input.length)
//   clone.set(input)
//   return clone
// }

// Tries to isolate just memory allocation and copy overhead of string js -> wasm -> js
export const copyString = (input: string) => {
  const inputJsTypedArray = new TextEncoder().encode(input)
  const inputAllocation = Allocation.copyFromJs(inputJsTypedArray)
  const outputAllocation = new Allocation(inputAllocation.size)
  outputAllocation.array.set(inputAllocation.array)
  inputAllocation.free()
  const output = new TextDecoder().decode(outputAllocation.array)
  outputAllocation.free()
  return output
}

export const compress = (inputJsTypedArray: Uint8Array, maxSize = inputJsTypedArray.byteLength) => {
  const inputAllocation = Allocation.copyFromJs(inputJsTypedArray)
  const outputAllocation = new Allocation(maxSize)
  const compressedSize = lz4Exports.compress(
    inputAllocation.pointer,
    inputAllocation.size,
    outputAllocation.pointer,
    outputAllocation.size
  )
  if (compressedSize > maxSize) return

  outputAllocation.resize(compressedSize)
  return outputAllocation
}

export const decompress = (inputAllocation: Allocation, maxSize: number) => {
  const outputAllocation = new Allocation(maxSize)
  const decompressedSize = lz4Exports.decompress(
    inputAllocation.pointer,
    inputAllocation.size,
    outputAllocation.pointer,
    outputAllocation.size
  )
  if (decompressedSize > maxSize) return

  outputAllocation.resize(decompressedSize)
  return outputAllocation
}

export const compressString = (input: string) => {
  const inputJsTypedArray = new TextEncoder().encode(input)
  const compressed = compress(inputJsTypedArray)
  if (!compressed) return
  return { compressed, decompressedSize: inputJsTypedArray.byteLength }
}

export const decompressString = ({ compressed, decompressedSize }: { compressed: Allocation, decompressedSize: number }) => {
  const outputAllocation = decompress(compressed, decompressedSize)
  if (!outputAllocation) return
  const ouput = new TextDecoder().decode(outputAllocation.array)
  outputAllocation.free()
  return ouput
}
