const express = require('express');
const app = express();
const routes = require('./controllers/routes');

const path = require('path');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.get('/', routes);
app.post('/register', routes);
app.get('/login', routes);
app.post('/login', routes);
app.get('/home', routes);
app.get('/logout', routes);
app.post('/addmsg', routes);

app.get('/create_event',routes);
app.get('/event_list', routes)
app.get('/event_registered_list', routes)

app.post('/events',routes)
app.get('/events/:eventID', routes)
app.post('/events/:eventID/register', routes)

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log("Server Stated At Port", PORT));