const lz4 = await WebAssembly.instantiateStreaming(
  fetch("./zig-out/bin/lz4.wasm"),
  {
    env: {
    }
  }
)

// Tries to isolate just memory allocation and copy overhead of compress() or decompress()
globalThis.copy = (inputJsTypedArray) => {
  const inputWasmPointer = lz4.instance.exports.malloc(inputJsTypedArray.byteLength)
  const inputWasmTypedArray = new Uint8Array(lz4.instance.exports.memory.buffer, inputWasmPointer, inputJsTypedArray.byteLength)
  inputWasmTypedArray.set(inputJsTypedArray)

  lz4.instance.exports.malloc(inputJsTypedArray.byteLength)
  const outputWasmTypedArray = new Uint8Array(lz4.instance.exports.memory.buffer, inputJsTypedArray, inputJsTypedArray.byteLength)

  const outputJsTypedArray = new Uint8Array(outputWasmTypedArray.byteLength)
  outputJsTypedArray.set(outputWasmTypedArray)
  return outputJsTypedArray
}

globalThis.compress = (inputJsTypedArray, maxSize = inputJsTypedArray.byteLength) => {
  const inputWasmPointer = lz4.instance.exports.malloc(inputJsTypedArray.byteLength)
  const inputWasmTypedArray = new Uint8Array(lz4.instance.exports.memory.buffer, inputWasmPointer, inputJsTypedArray.byteLength)
  inputWasmTypedArray.set(inputJsTypedArray)

  const outputPointer = lz4.instance.exports.malloc(maxSize)
  const compressedSize = lz4.instance.exports.compress(inputWasmPointer, inputJsTypedArray.byteLength, outputPointer, maxSize)
  if (compressedSize > maxSize) return
  const outputWasmTypedArray = new Uint8Array(lz4.instance.exports.memory.buffer, outputPointer, compressedSize)

  const outputJsTypedArray = new Uint8Array(outputWasmTypedArray.byteLength)
  outputJsTypedArray.set(outputWasmTypedArray)
  return outputJsTypedArray
}

globalThis.decompress = (inputJsTypedArray, maxSize) => {
  const inputWasmPointer = lz4.instance.exports.malloc(inputJsTypedArray.byteLength)
  const inputWasmTypedArray = new Uint8Array(lz4.instance.exports.memory.buffer, inputWasmPointer, inputJsTypedArray.byteLength)
  inputWasmTypedArray.set(inputJsTypedArray)

  const outputPointer = lz4.instance.exports.malloc(maxSize)
  const decompressedSize = lz4.instance.exports.decompress(inputWasmPointer, inputJsTypedArray.byteLength, outputPointer, maxSize)
  if (decompressedSize > maxSize) return
  const outputWasmTypedArray = new Uint8Array(lz4.instance.exports.memory.buffer, outputPointer, decompressedSize)

  const outputJsTypedArray = new Uint8Array(outputWasmTypedArray.byteLength)
  outputJsTypedArray.set(outputWasmTypedArray)
  return outputJsTypedArray
}

globalThis.compressString = input => {
  const inputJsTypedArray = new TextEncoder().encode(input)
  return { compressed: compress(inputJsTypedArray), decompressedSize: inputJsTypedArray.byteLength }
}

globalThis.decompressString = ({ compressed, decompressedSize }) => {
  const outputJsTypedArray = decompress(compressed, decompressedSize)
  return new TextDecoder().decode(outputJsTypedArray)
}

const testData = [
  {
      "id": 1,
      "name": "Leanne Graham",
      "username": "Bret",
      "email": "Sincere@april.biz",
      "address": {
          "street": "Kulas Light",
          "suite": "Apt. 556",
          "city": "Gwenborough",
          "zipcode": "92998-3874",
          "geo": {
              "lat": "-37.3159",
              "lng": "81.1496"
          }
      },
      "phone": "1-770-736-8031 x56442",
      "website": "hildegard.org",
      "company": {
          "name": "Romaguera-Crona",
          "catchPhrase": "Multi-layered client-server neural-net",
          "bs": "harness real-time e-markets"
      }
  },
  {
      "id": 2,
      "name": "Ervin Howell",
      "username": "Antonette",
      "email": "Shanna@melissa.tv",
      "address": {
          "street": "Victor Plains",
          "suite": "Suite 879",
          "city": "Wisokyburgh",
          "zipcode": "90566-7771",
          "geo": {
              "lat": "-43.9509",
              "lng": "-34.4618"
          }
      },
      "phone": "010-692-6593 x09125",
      "website": "anastasia.net",
      "company": {
          "name": "Deckow-Crist",
          "catchPhrase": "Proactive didactic contingency",
          "bs": "synergize scalable supply-chains"
      }
  },
  {
      "id": 3,
      "name": "Clementine Bauch",
      "username": "Samantha",
      "email": "Nathan@yesenia.net",
      "address": {
          "street": "Douglas Extension",
          "suite": "Suite 847",
          "city": "McKenziehaven",
          "zipcode": "59590-4157",
          "geo": {
              "lat": "-68.6102",
              "lng": "-47.0653"
          }
      },
      "phone": "1-463-123-4447",
      "website": "ramiro.info",
      "company": {
          "name": "Romaguera-Jacobson",
          "catchPhrase": "Face to face bifurcated interface",
          "bs": "e-enable strategic applications"
      }
  },
  {
      "id": 4,
      "name": "Patricia Lebsack",
      "username": "Karianne",
      "email": "Julianne.OConner@kory.org",
      "address": {
          "street": "Hoeger Mall",
          "suite": "Apt. 692",
          "city": "South Elvis",
          "zipcode": "53919-4257",
          "geo": {
              "lat": "29.4572",
              "lng": "-164.2990"
          }
      },
      "phone": "493-170-9623 x156",
      "website": "kale.biz",
      "company": {
          "name": "Robel-Corkery",
          "catchPhrase": "Multi-tiered zero tolerance productivity",
          "bs": "transition cutting-edge web services"
      }
  },
  {
      "id": 5,
      "name": "Chelsey Dietrich",
      "username": "Kamren",
      "email": "Lucio_Hettinger@annie.ca",
      "address": {
          "street": "Skiles Walks",
          "suite": "Suite 351",
          "city": "Roscoeview",
          "zipcode": "33263",
          "geo": {
              "lat": "-31.8129",
              "lng": "62.5342"
          }
      },
      "phone": "(254)954-1289",
      "website": "demarco.info",
      "company": {
          "name": "Keebler LLC",
          "catchPhrase": "User-centric fault-tolerant solution",
          "bs": "revolutionize end-to-end systems"
      }
  },
  {
      "id": 6,
      "name": "Mrs. Dennis Schulist",
      "username": "Leopoldo_Corkery",
      "email": "Karley_Dach@jasper.info",
      "address": {
          "street": "Norberto Crossing",
          "suite": "Apt. 950",
          "city": "South Christy",
          "zipcode": "23505-1337",
          "geo": {
              "lat": "-71.4197",
              "lng": "71.7478"
          }
      },
      "phone": "1-477-935-8478 x6430",
      "website": "ola.org",
      "company": {
          "name": "Considine-Lockman",
          "catchPhrase": "Synchronised bottom-line interface",
          "bs": "e-enable innovative applications"
      }
  },
  {
      "id": 7,
      "name": "Kurtis Weissnat",
      "username": "Elwyn.Skiles",
      "email": "Telly.Hoeger@billy.biz",
      "address": {
          "street": "Rex Trail",
          "suite": "Suite 280",
          "city": "Howemouth",
          "zipcode": "58804-1099",
          "geo": {
              "lat": "24.8918",
              "lng": "21.8984"
          }
      },
      "phone": "210.067.6132",
      "website": "elvis.io",
      "company": {
          "name": "Johns Group",
          "catchPhrase": "Configurable multimedia task-force",
          "bs": "generate enterprise e-tailers"
      }
  },
  {
      "id": 8,
      "name": "Nicholas Runolfsdottir V",
      "username": "Maxime_Nienow",
      "email": "Sherwood@rosamond.me",
      "address": {
          "street": "Ellsworth Summit",
          "suite": "Suite 729",
          "city": "Aliyaview",
          "zipcode": "45169",
          "geo": {
              "lat": "-14.3990",
              "lng": "-120.7677"
          }
      },
      "phone": "586.493.6943 x140",
      "website": "jacynthe.com",
      "company": {
          "name": "Abernathy Group",
          "catchPhrase": "Implemented secondary concept",
          "bs": "e-enable extensible e-tailers"
      }
  },
  {
      "id": 9,
      "name": "Glenna Reichert",
      "username": "Delphine",
      "email": "Chaim_McDermott@dana.io",
      "address": {
          "street": "Dayna Park",
          "suite": "Suite 449",
          "city": "Bartholomebury",
          "zipcode": "76495-3109",
          "geo": {
              "lat": "24.6463",
              "lng": "-168.8889"
          }
      },
      "phone": "(775)976-6794 x41206",
      "website": "conrad.com",
      "company": {
          "name": "Yost and Sons",
          "catchPhrase": "Switchable contextually-based project",
          "bs": "aggregate real-time technologies"
      }
  },
  {
      "id": 10,
      "name": "Clementina DuBuque",
      "username": "Moriah.Stanton",
      "email": "Rey.Padberg@karina.biz",
      "address": {
          "street": "Kattie Turnpike",
          "suite": "Suite 198",
          "city": "Lebsackbury",
          "zipcode": "31428-2261",
          "geo": {
              "lat": "-38.2386",
              "lng": "57.2232"
          }
      },
      "phone": "024-648-3804",
      "website": "ambrose.net",
      "company": {
          "name": "Hoeger LLC",
          "catchPhrase": "Centralized empowering task-force",
          "bs": "target end-to-end models"
      }
  }
]

for (let i = 0; i < 3; i++) {
  console.time("round-trip json without lz4")
  JSON.parse(JSON.stringify(testData))
  console.timeEnd("round-trip json without lz4")
}

for (let i = 0; i < 3; i++) {
  console.time("round-trip json with lz4")
  JSON.parse(decompressString(compressString(JSON.stringify(testData))))
  console.timeEnd("round-trip json with lz4")
}

const jsonAsTypedArray = new TextEncoder().encode(JSON.stringify(testData))
const compressed = compress(jsonAsTypedArray)
console.log(`compressed: ${compressed.byteLength} decompressed: ${jsonAsTypedArray.byteLength} ratio: ${compressed.byteLength / jsonAsTypedArray.byteLength}`)

for (let i = 0; i < 3; i++) {
  console.time("round-trip memory transfer like lz4")
  copy(jsonAsTypedArray)
  copy(compressed)
  console.timeEnd("round-trip memory transfer like lz4")
}
