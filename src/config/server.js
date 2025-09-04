const express = require('express');
const cors = require('cors');

class Server{
    
    constructor(){
        this.port = process.env.PORT || 5000;
        this.app = express();
        this.middleware();
        this.routers();   
    }
    

    
    middleware(){
        this.app.use(cors());
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