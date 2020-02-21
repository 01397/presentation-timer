const cacheFiles = ['./main.js', './style.css']

const install = event =>
  event.waitUntil(
    caches
      .open('v1')
      .then(cache => {
        cacheFiles.map(path => fetch(new Request(path)).then(response => cache.put(path, response)))
      })
      .catch(function(err) {
        console.log(err)
      })
  )

self.addEventListener('fetch', event => {})
self.addEventListener('install', install)
self.addEventListener('message', install)
