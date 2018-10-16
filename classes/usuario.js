module.exports = class Usuario {

  constructor(dni, password, bcrypt, idRol){
    this.dni = dni;
    this.id_rol = idRol;
    this.password = bcrypt.hashSync(password);
    this.estado = 'inactivo';
    this.joined = new Date();
  }

}
