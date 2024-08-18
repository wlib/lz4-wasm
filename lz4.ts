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
  compress: (inputPointer: number, inputLength: number, outputPointer: number, outputLength: number) => number
  decompress: (inputPointer: number, inputLength: number, outputPointer: number, outputLength: number) => number
}

class Allocation {
  #pointer: number
  #size: number

  constructor(size: number) {
    this.#pointer = lz4Exports.malloc(size)
    this.#size = size
  }

  get pointer() {
    return this.#pointer
  }

  get size() {
    return this.#size
  }

  get array(): Uint8Array {
    return new Uint8Array(lz4Exports.memory.buffer, this.#pointer, this.#size)
  }

  static copyFromJs(array: Uint8Array) {
    const allocation = new Allocation(array.byteLength)
    allocation.array.set(array)
    return allocation
  }

  copyToJs(begin?: number, end?: number) {
    const array = this.array.subarray(begin, end)
    const jsTypedArray = new Uint8Array(array.byteLength)
    jsTypedArray.set(array)
    return jsTypedArray
  }
}

// Tries to isolate just memory allocation and copy overhead of compress() or decompress()
export const copy = (inputJsTypedArray: Uint8Array) => {
  const inputAllocation = Allocation.copyFromJs(inputJsTypedArray)
  const outputAllocation = new Allocation(inputJsTypedArray.byteLength)
  outputAllocation.array.set(inputAllocation.array)
  return outputAllocation.copyToJs()
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

  return outputAllocation.copyToJs(0, compressedSize)
}

export const decompress = (inputJsTypedArray: Uint8Array, maxSize: number) => {
  const inputAllocation = Allocation.copyFromJs(inputJsTypedArray)
  const outputAllocation = new Allocation(maxSize)
  const decompressedSize = lz4Exports.decompress(
    inputAllocation.pointer,
    inputAllocation.size,
    outputAllocation.pointer,
    outputAllocation.size
  )
  if (decompressedSize > maxSize) return

  return outputAllocation.copyToJs(0, decompressedSize)
}

export const compressString = (input: string) => {
  const inputJsTypedArray = new TextEncoder().encode(input)
  const compressed = compress(inputJsTypedArray)
  if (!compressed) return
  return { compressed, decompressedSize: inputJsTypedArray.byteLength }
}

export const decompressString = ({ compressed, decompressedSize }: { compressed: Uint8Array, decompressedSize: number }) => {
  const outputJsTypedArray = decompress(compressed, decompressedSize)
  return new TextDecoder().decode(outputJsTypedArray)
}
