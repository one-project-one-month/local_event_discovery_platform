import express from 'express'
import dotenv from 'dotenv'
import userRoute from './routes/userRoute.js'
import eventRoute from './routes/eventRoute.js'

dotenv.config();

const app = express()
app.use(express.json())


app.get("/",(req,res)=>{
    return res.status(200).json('Hello World')
})


// routes
app.use("/api/v1/user",userRoute)
app.use("/api/v1/event",eventRoute)




export default app;