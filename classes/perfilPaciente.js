module.exports = class Paciente {

  constructor(nombre, apellido, dni, email, sexo, edad, fechaNacimiento, nacionalidad, estadoCivil, telefonoFijo, telefonoCelular, contactosEmergencia, id_historia, domicilio){
    this.nombre = nombre;
    this.apellido = apellido;
    this.dni = dni;
    this.email = email;
    this.sexo = sexo;
    this.edad = edad;
    this.fechaNacimiento = fechaNacimiento;
    this.nacionalidad = nacionalidad;
    this.estadoCivil = estadoCivil;
    this.telefonoFijo = telefonoFijo;
    this.telefonoCelular = telefonoCelular;
    this.contactosEmergencia = contactosEmergencia;
    this.id_historia = id_historia;
    this.domicilio = domicilio
  }

}
