const express = require('express');
const ejs = require('ejs');
const sqlite3 = require('sqlite3').verbose();
const elasticlunr = require("elasticlunr");
const db = new sqlite3.Database('data.db');
const app = express();
const port = 3000;

app.set('view engine', 'ejs'); 
app.set('views', __dirname + '/views'); 


//Create your index
//Specify fields you want to include in search
//Specify reference you want back (i.e., page ID)
const index = elasticlunr(function () {
  this.addField('title');
  this.addField('content');
  this.setRef('url');
});

// Fetch data from the database.
db.serialize(() => {
  db.all('SELECT data,url FROM content', (err, rows) => {
    if (err) {
      console.error(err.message);
      return;
    }
    
    // Index the data.
    rows.slice(0,10).forEach((row) => {
      let fruits = row.data
      let datas = fruits.split('\n')
      let _fruits =  Array.from(new Set(datas))
      let title = _fruits.join(' ').trim()
      let document = { title: title, content: row.data, url: row.url }
      index.addDoc(document);
    });
  });
});


app.get('/', (req, res) => {
  res.render('search', { results: [], searchTerm: '' });
});


app.get('/search', (req, res) => {
  const searchTerm = req.query.q;

  let results = index.search(searchTerm, {})
  
  const _results = results.slice(0, 10).map(( item, i) => {
    
    const id = item.ref; 
    const document = index.documentStore.getDoc(id);
    return `score: ${item.score}   ||   title: ${document.title}   ||    url: ${item.ref}`
  });

  res.render('search', { results: _results, searchTerm });

});



app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});

/*
Elasticlunr supports much more customization:
  -boosting on specific fields
  -specifying boolean model (AND/OR)
  -customizing tokenization, stop words, etc.
More documentation: http://elasticlunr.com/docs/index.html
*/
