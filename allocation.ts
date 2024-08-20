export const makeAllocationClass = (wasmExports: {
  memory: WebAssembly.Memory,
  malloc: (size: number) => number,
  resize: (pointer: number, size: number) => boolean,
  free: (pointer: number) => void
}) => {
  const allocationRegistry = new FinalizationRegistry((pointer: number) => {
    wasmExports.free(pointer)
  })

  return class Allocation {
    #pointer: number
    #size: number
    #freed = false
    #autoFree = false

    constructor(size: number) {
      if (size <= 0)
        throw new Error("size must be positive")

      this.#pointer = wasmExports.malloc(size)
      if (!this.#pointer)
        throw new Error("malloc failed")

      this.#size = size
      this.autoFree = true
    }

    #freeCheck() {
      if (this.#freed)
        throw new Error("use after free")
    }

    get pointer() {
      this.#freeCheck()

      return this.#pointer
    }

    get size() {
      this.#freeCheck()

      return this.#size
    }

    get array() {
      this.#freeCheck()

      this.autoFree = false
      return new Uint8Array(wasmExports.memory.buffer, this.#pointer, this.#size)
    }

    get autoFree() {
      this.#freeCheck()

      return this.#autoFree
    }

    set autoFree(autoFree: boolean) {
      this.#freeCheck()

      if (autoFree === this.#autoFree) return

      if (autoFree)
        allocationRegistry.register(this, this.#pointer, this)
      else
        allocationRegistry.unregister(this)

      this.#autoFree = autoFree
    }

    free() {
      this.#freeCheck()

      wasmExports.free(this.#pointer)
      this.#freed = true

      if (this.#autoFree)
        allocationRegistry.unregister(this)
    }

    resize(size: number) {
      this.#freeCheck()

      if (size === this.#size)
        return this

      const actuallyResizedAllocation = wasmExports.resize(this.#pointer, size)
      if (actuallyResizedAllocation || size < this.#size) {
        this.#size = size
        return this
      }

      // failed to grow underlying allocation
      const newAllocation = new Allocation(size)
      newAllocation.array.set(this.array)
      newAllocation.autoFree = true
      this.free()
      return newAllocation
    }

    static copyFromJs(array: Uint8Array) {
      const allocation = new Allocation(array.byteLength)
      allocation.array.set(array)
      allocation.autoFree = true
      return allocation
    }
  }
}
