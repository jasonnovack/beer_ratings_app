let resultsObject = [];
let selectedObject = {};

window.addEventListener('load', () => {
  const searchForm = document.querySelector('#search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', e => {
      const query = document.querySelector('#search-input').value;
      fetch(`/${env}/search`, {
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
      selectedObject = resultsObject.filter(item => item.beer.id === selectedBeer)[0];
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

  modalSave.addEventListener('click', e => {
    if (ratingScore.value && ratingScore.value >= 0 && ratingScore.value <= 10 && ratingDate.value && ratingPassword.value) {
      let beer = {};
      beer.password = ratingPassword.value;
      beer.score = ratingScore.value;
      beer.createdAt = Date.parse(ratingDate.value);
      if (ratingComment.value.length > 0) {
        beer.comment = ratingComment.value;
      }
      if (selectedObject && selectedObject.beer) {
        if (selectedObject.beer.id) {
          beer.id = selectedObject.beer.id;
        }
        if (selectedObject.beer.name) {
          beer.name = selectedObject.beer.name;
        }
        if (selectedObject.beer.abv) {
          beer.abv = selectedObject.beer.abv;
        }
        if (selectedObject.beer.ibu) {
          beer.ibu = selectedObject.beer.ibu;
        }
        if (selectedObject.beer.overallScore) {
          beer.rateBeerScore = selectedObject.beer.overallScore;
        }
        if (selectedObject.beer.imageUrl && selectedObject.beer.imageUrl.length > 0) {
          beer.image = selectedObject.beer.imageUrl;
        }
        if (selectedObject.beer.brewer) {
          if (selectedObject.beer.brewer.name && selectedObject.beer.brewer.name.length > 0) {
            beer.brewer = selectedObject.beer.brewer.name;
          }
          if (selectedObject.beer.brewer.type && selectedObject.beer.brewer.type.length > 0) {
            beer.brewerType = selectedObject.beer.brewer.type;
          }
          if (selectedObject.beer.brewer.streetAddress && selectedObject.beer.brewer.streetAddress.length > 0) {
            beer.streetAddress = selectedObject.beer.brewer.streetAddress;
          }
          if (selectedObject.beer.brewer.city && selectedObject.beer.brewer.city.length > 0) {
            beer.city = selectedObject.beer.brewer.city;
          }
          if (selectedObject.beer.brewer.state && selectedObject.beer.brewer.state.name && selectedObject.beer.brewer.state.name.length > 0) {
            beer.state = selectedObject.beer.brewer.state.name;
          }
          if (selectedObject.beer.brewer.country.name && selectedObject.beer.brewer.country.name.length > 0) {
            beer.country = selectedObject.beer.brewer.country.name;
          }
          if (selectedObject.beer.brewer.zip && selectedObject.beer.brewer.zip.length > 0) {
            beer.zip = selectedObject.beer.brewer.zip;
          }
          if (selectedObject.beer.brewer.id && selectedObject.beer.brewer.id.length > 0) {
            beer.brewerId = selectedObject.beer.brewer.id;
          }
          if (selectedObject.beer.brewer.imageUrl && selectedObject.beer.brewer.imageUrl.length > 0) {
            beer.brewerImage = selectedObject.beer.brewer.imageUrl;
          }
        }
        if (selectedObject.beer.style) {
          if (selectedObject.beer.style.id && selectedObject.beer.style.id.length > 0) {
            beer.styleId = selectedObject.beer.style.id;
          }
          if (selectedObject.beer.style.name && selectedObject.beer.style.name.length > 0) {
            beer.style = selectedObject.beer.style.name;
          }
          if (selectedObject.beer.style.parent.name && selectedObject.beer.style.parent.name.length > 0) {
            beer.styleParent = selectedObject.beer.style.parent.name;
          }
        }
      }
      fetch(`/${env}/beers`, {
        'method': 'POST',
        'body': JSON.stringify(beer),
        'headers': {
          'content-type': 'application/json'
        }
      }).catch(e => {
        console.log(e);
      });
      console.log('new rating: ', beer.name);
      return false;
    };
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