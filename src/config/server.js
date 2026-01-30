const express = require('express');
const cors = require('cors');

class Server{
    
    constructor(){
        this.port = process.env.PORT || 5000;
        this.app = express();
        this.middleware();
        this.routers();   
    }
    

    
    middleware() {
  const allowedOrigins = [
    'https://cleanbb-admin.vercel.app',
    'http://localhost:4200'
  ];

  this.app.use(cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));

  
  this.app.options('*', cors());

  this.app.use(express.json());
  this.app.use(express.urlencoded({ extended: true }));
}


    routers(){
        this.app.get('/', (req, res) => {
            res.send('Hello World!');
          })
        
          this.app.use('/api/v1', require('../routes/routes'));
          
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log(`Escuchando en el puerto ${this.port}`);
          })
    }
}


module.exports = Server;