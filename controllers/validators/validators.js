//Validar que la pass tenga al menos un digito, al menos una minuscula, al menos una mayuscula y al menos 8 caracteres
const validarPassword = (password) => {
	const regExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;
	return regExp.test(password);
}

// Valida si un input es sólo números
const validarNumeros = (input) => {
    const regEx = /^[0-9]*$/;
    return regEx.test(input);
}

// Valida si un input ingresado es solo letras y espacios
const validarLetras = (input) => {
	const regEx = /^[a-zA-Z\s]*$/;
	return regEx.test(input);
}

//Valida si un input es un email valido
const validarEmail = (email) => {
	const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return regEx.test(email);
}

module.exports = {
  validarPassword,
  validarNumeros,
  validarLetras,
  validarEmail
}
