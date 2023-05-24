import { NextApiRequest, NextApiResponse } from 'next';
import Cors from 'cors';
import mysql from 'mysql';
import jwt from 'jsonwebtoken';

const cors = Cors({ origin: true });

const connection = mysql.createConnection({
  host: '129.148.55.118',
  port: 3306, // Porta do MySQL
  user: 'QualityAdmin',
  password: '@Tesla1977',
  database: 'qualityseg_db',
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Conectado ao banco de dados MySQL!');
});

connection.query(
  'CREATE DATABASE IF NOT EXISTS qualityseg_db',
  function (error, results, fields) {
    if (error) throw error;
    // Banco de dados criado ou já existente
  }
);

connection.query('USE qualityseg_db', function (error, results, fields) {
  if (error) throw error;
  // Banco de dados selecionado para uso
});

connection.query(
  `CREATE TABLE IF NOT EXISTS cadastro (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255),
    senha VARCHAR(255)
  )`,
  function (error, results, fields) {
    if (error) throw error;
    // Tabela criada ou já existente
  }
);

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  return new Promise((resolve, reject) => {
    cors(req, res, () => {
      if (req.method === 'POST') {
        if (req.url === '/register') {
          const { email, senha } = req.body;
          const query = `INSERT INTO cadastro (email, senha) VALUES ('${email}', '${senha}')`;
          connection.query(query, (err, result) => {
            if (err) throw err;
            res.send('Usuário cadastrado com sucesso!');
            resolve();
          });
        } else if (req.url === '/login') {
          const { email, senha } = req.body;
          const query = `SELECT * FROM cadastro WHERE email='${email}' AND senha='${senha}'`;
          connection.query(query, (err, result) => {
            if (err) throw err;
            if (result.length > 0) {
              const user = result[0];
              const token = jwt.sign(
                { id: user.id, email: user.email },
                'secret_key'
              );
              res.send({ success: true, token });
            } else {
              res.send({ success: false });
            }
            resolve();
          });
        } else {
          res.status(404).send('Rota não encontrada');
          resolve();
        }
      } else {
        res.status(405).send('Método não permitido');
        resolve();
      }
    });
  });
};

export default handler;
