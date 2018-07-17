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
        console.log(response);
      })
      console.log(query);

      e.preventDefault();
      return false;
    });
    console.log('hi');  
  }
})