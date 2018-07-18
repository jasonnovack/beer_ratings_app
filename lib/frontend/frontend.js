let resultsObject = [];

window.addEventListener('load', () => {
  const searchForm = document.querySelector('#search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', e => {
      const query = document.querySelector('#search-input').value;
      fetch('/dev/search', {
        'method': 'POST',
        'body': JSON.stringify({query}),
        'headers': {
          'content-type': 'application/json'
        }
      }).then(response => {
        return response.json();
      }).then(searchResults => {
        resultsObject = searchResults;
        let resultsHtml = `<div class='query'>Results for "${document.querySelector('#search-input').value}"</div>`;
        searchResults.forEach(item => {
          resultsHtml += `<div id='beer-${item.beer.id}' class='result'>`;
          resultsHtml +=   `<div class='img' style='background-image: url(${item.beer.imageUrl});'></div>`;
          resultsHtml +=     `<div class='info'>`;
          resultsHtml +=       `<div class='name'>${item.beer.name}</div>`;
          resultsHtml +=       `<div class='style'>${item.beer.style.name}</div>`;
          resultsHtml +=     `<div class='brewer'>${item.beer.brewer.name}</div>`;
          resultsHtml +=   `</div>`;
          if (item.rating && item.rating.score) {
            resultsHtml +=   `<div class='rating'>${item.rating.score}</div>`;
          }
          resultsHtml += `</div>`;
        });
        document.getElementById('search-results').innerHTML = resultsHtml;
        document.getElementById('search-input').blur();
      }).catch(e => {
        console.log(e);
      });
      console.log(query);
      e.preventDefault();
      return false;
    });
  }

  const resultsList = document.getElementById('search-results');
  const modal = document.getElementById('rating-modal');
  resultsList.addEventListener('click', e => {
    if (resultsList.innerHTML !== null) {
      let selectedBeer = e.target.id.substring(5);
      let selectedObject = resultsObject.filter(item => item.beer.id === selectedBeer);
      document.getElementById('modal-content').innerHTML += JSON.stringify(selectedObject, null, 2);
      modal.style.display = 'block';
    }
  });

  const modalClose = document.getElementsByClassName('close')[0];
  modalClose.addEventListener('click', e => {
    if (e.target === document.getElementById('modal-content')) {
      modal.style.display = 'none';
    }
  });
});