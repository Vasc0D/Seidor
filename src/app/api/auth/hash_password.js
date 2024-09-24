// hash-password.js (usando require)
const bcrypt = require('bcrypt');

async function generateHashedPassword() {
  const password = 'JorgeS3idorAdmin'; // Cambia por la contraseña que deseas
  const saltRounds = 10;

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('Contraseña encriptada:', hashedPassword);
  } catch (err) {
    console.error('Error al hashear la contraseña:', err);
  }
}

generateHashedPassword();
