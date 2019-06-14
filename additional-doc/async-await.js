
// ######### THIS IS NOT PART OF THE EMAILY APP BUT A SHORT EXEMPLE OF HOW ASYNC AWAIT SYNTAXE WORKS ###########

// COPY THE CODE BELOW TO TEST IT IN YOUR BROWSER CONSOLE 


// write a function to retrieve a blob of json
// make an ajax request ! Use the 'fetch' function
// http://rallycoding.herokuapp.com/api/music_albums (here is a blob of json)

function fetchAlbums() {
  await fetch('http://rallycoding.herokuapp.com/api/music_albums')
    .then(res => res.json())
    .then(json => console.log(json));
}

fetchAlbums();

// fetch() return a promess
// .then() return a response after the fetch statement (promess) is done


// NOW WE REFACTO WITH THE ASYNC AWAIT SYNTAXE

async function fetchAlbums() {
  const res = await fetch('http://rallycoding.herokuapp.com/api/music_albums')
  const json = await res.json()

  console.log(json);
}

fetchAlbums();

// async says it's gonna be asynchronus code
// await says it's a promess

// NOW REFACTO AS AN ARROW FX

const fetchAlbums = async () => {
  const res = await fetch('http://rallycoding.herokuapp.com/api/music_albums')
  const json = await res.json()

  console.log(json);
}

fetchAlbums();
