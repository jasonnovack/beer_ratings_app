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
        document.querySelector('#query').innerHTML = `Results for "${document.querySelector('#search-input').value}`;
        let resultsHtml = '';
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
        document.querySelector('#search-results').innerHTML = resultsHtml;
        document.querySelector('#search-input').blur();
      }).catch(e => {
        console.log(e);
      });
      console.log(query);
      e.preventDefault();
      return false;
    });
  };

  const resultsList = document.querySelector('#search-results');
  const modal = document.querySelector('#rating-modal');
  const modalContent = document.querySelector('#modal-content');
  const modalInfo = document.querySelector('#modal-info');
  const modalClose = document.querySelector('#close-button');
  const modalSave = document.querySelector('#save-button');
  const ratingForm = document.querySelector('#rating-form');
  const ratingScore = document.querySelector('#rating-score');
  const ratingDate = document.querySelector('#rating-date');
  const ratingComment = document.querySelector('#rating-comment');
  const ratingPassword = document.querySelector('#rating-password');
  
  resultsList.addEventListener('click', e => {
    if (resultsList.innerHTML !== null) {
      let selectedBeer = e.target.id.substring(5);
      let selectedObject = resultsObject.filter(item => item.beer.id === selectedBeer)[0];
      modalInfo.innerHTML = e.target.innerHTML;
      modalInfo.style.width = e.target.getBoundingClientRect().width;
      modal.style.display = 'block';
      if (selectedObject.rating) {
        modalSave.style.display = 'none';
      } else {
        ratingForm.style.display = 'block';
        document.querySelector('#rating-date').placeholder = `${new Date().toLocaleString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}`;
        document.querySelector('#rating-date').max = `${new Date().toISOString().split('T')[0]}`;
      }
    }
  });
  
  modalClose.addEventListener('click', e => {
    modal.style.display = 'none';
    ratingForm.style.display = 'none';
    ratingForm.reset();
  });

  document.querySelectorAll('#rating-form input').forEach(el => {
    addEventListener('input', e => {
      if (ratingScore.value && ratingScore.value >= 0 && ratingScore.value <= 10 && ratingDate.value && ratingPassword.value) {
        modalSave.style.display = 'block';
      } else {
        modalSave.style.display = 'none';
      }
    });
  });
});