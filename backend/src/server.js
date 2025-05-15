import http from 'http'
import app from './index.js'


const sever = http.createServer(app)

const PORT = process.env.PORT || 8080;


sever.listen(PORT,()=>{
    console.log(`server is running on PORT ${PORT}`)
})