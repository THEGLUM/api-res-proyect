const movies = require('./movies.json');
const crypto = require('node:crypto');
const express = require('express');
const { validarDatos, validacionParcial } = require('./schemas/validarPeticion.js');

const app = express();
const PORT = process.env.PORT ?? 3200;
app.disable('x-powered-by');
app.use(express.json());

// paginas permitidas
const ACEPT_ORIGENES = [
	"http://localhost:8080",
	"https://google.com"
];

// mandamos todas las peliculas
app.get('/movies', (resq, res) => {
	const origin = resq.header('origin');
	if(ACEPT_ORIGENES.includes(origin) || !origin){
		res.header('Access-Control-Allow-Origin', origin);
	}
	const { genre } = resq.query;

	if (genre) {
		const filterMovies = movies.filter((movie) => movie.genre.some((g) => g.toLowerCase() == genre.toLowerCase()));
		return res.json(filterMovies);
	}
	res.json(movies);
});

// devolvemos la pelicula con el id
app.get('/movies/:id', (req, res) => {
	const { id } = req.params;
	const movie = movies.find((movie) => movie.id == id);
	if (movie) return res.json(movie);

	res.status(404).json({ mensaje: 'peli no encontrada 🙁' });
});

// cramos nueva pelicula (recurso)
app.post('/movies', (req, res) => {
	const resultado = validarDatos(req.body);

	if (resultado.error) {
		res.status(400).json({ //bad request
			error : JSON.parse(resultado.error.message)
		})
	}
	const newMovie = {
		id: crypto.randomUUID(),
		...resultado.data,
	};

	movies.push(newMovie);

	res.status(201).json(newMovie);
});

// actualizamos el rcurso
app.patch('/movies/:id', (req, res)=>{
	const {id} = req.params;
	const movieIndex = movies.findIndex(pelicula => pelicula.id === id);

	if(movieIndex === -1){
		return res.status(404).json({
			error : "pelicula no encontrada"
		});
	}

	const validacion = validacionParcial(req.body);


	if(!validacion.success){
		return res.status(400).json({
			error : JSON.parse(validacion.error.message)
		});
	}

	const peliculaActualizada = {
		...movies[movieIndex],
		...validacion.data
	}


	movies[movieIndex] = peliculaActualizada;

	res.status(200).json(movies)
})



// si no tenemos ninguna peticion devolvemos lo siguiente
app.use('/', (resq, res) => {
	res.json({ 404: 'no encontrado' });
});

app.listen(PORT, () => {
	console.log(`server listen on port http://localhost:${PORT}`);
});
