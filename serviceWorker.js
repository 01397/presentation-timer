//v2
const cacheFiles = ['./main.js', './style.css']

const install = event => {
  self.skipWaiting()

  event.waitUntil(
    caches
      .open('v1')
      .then(cache => {
        cacheFiles.map(path => fetch(new Request(path)).then(response => cache.put(path, response)))
      })
      .catch(err => {
        console.log(err)
      })
  )
}

self.addEventListener('fetch', event => {})
self.addEventListener('install', install)
self.addEventListener('message', event => {
  install(event)
  event.ports[0].postMessage('updated')
})
