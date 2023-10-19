const z = require('zod');

const esquemaPeticion = z.object({
	title: z.string({
		required_error: 'el titulo de la pelicula es requerido',
	}),
	year: z.number().int().positive().min(1900).max(2024),
	duration: z.number().positive().int(),
	rate: z.number().min(0).max(10).default(5),
	poster: z.string().url({
		message: 'el poster es invalido'
	}),
	genre: z.array(z.enum(['Action', 'Adventure', 'Drama', 'Fantasy', 'Horror', 'Thriller', 'Sci-Fi', 'Comedy']), {
		required_error: 'la pelicula requiere el genero',
		invalid_type_error: 'la pelicula debe de ser un array con los generos',
	}),
});

// validamos la informacion con obligacions en el objeto
function validarDatos(object) {
	return esquemaPeticion.safeParse(object);
}

// volvemos todos los parametros en opcionales
function validacionParcial(object){
	return esquemaPeticion.partial().safeParse(object);
}



module.exports = {
	validarDatos,
	validacionParcial,
};
