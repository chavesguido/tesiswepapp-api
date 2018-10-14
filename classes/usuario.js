module.exports = class Usuario {

  constructor(dni, password, bcrypt, idRol){
    this.dni = dni;
    this.rol_id = idRol;
    this.password = bcrypt.hashSync(password);
    this.estado = 'inactivo';
    this.joined = new Date();
  }

}
