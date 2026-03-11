import express from 'express';
import {Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', './views');



app.get('/',(req : Request,res : Response) =>{
    res.render('home',{title : "Home Page"});
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});