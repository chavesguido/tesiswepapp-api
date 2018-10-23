module.exports = class Paciente {

  constructor(nombre, apellido, fechaNacimiento, sexo, email, idUsuario){
    this.nombre = nombre;
    this.apellido = apellido;
    this.fechaNacimiento = fechaNacimiento;
    this.sexo = sexo;
    this.email = email;
    this.id_usuario = idUsuario;
    let aux = new Date();
    let aux2 = this.fechaNacimiento.split('-');
    this.edad = aux.getFullYear() - Number(aux2[0]);
  }

}
