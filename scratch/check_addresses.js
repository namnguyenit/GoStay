const http = require('http');

function getPlaces() {
  http.get('http://localhost:3000/api/v1/places', (res) => { // assuming there is a local API running or maybe directly check backend?
    // Actually the easiest is to grep the dummy data in page.tsx to see what it is
  });
}
