require('dotenv').config()
const mongoose = require('mongoose')
const express = require('express')
var app = express();
const PORT = 3000;
import('node-fetch').then(fetchModule => {
    const fetch = fetchModule.default;
    // Your code that uses fetch...
  }).catch(error => {
    console.error('Error importing node-fetch:', error);
  });

mongoose.connect("mongodb://127.0.0.1:27017/mongoapi")

     


const postSchema = new mongoose.Schema({
    id: {
        type:Number,
        required:true
    },
    name: {
        type:String,
        required:true
    },
    html_url:{
        type:String,
        required:true
    },
    description: {
        type:String,
        required:true
    },
    created_at: {
        type:String,
        required:true
    },
    open_issues:{
        type:Number,
        required:true
    },
    watchers: {
        type:Number,
        required:true
    },
    owner: {
      id: {
        type:String,
        required:true
    },
      avatar_url:{
        type:String,
        required:true
    },
      html_url: {
        type:String,
        required:true
    },
      type: {
        type:Number,
        required:true
    },
      site_admin:{
        type:Boolean,
        required:true
    }}
});

const Post = mongoose.model('Posts',postSchema);

async function getPosts(){

    const myPosts = await fetch("https://api.github.com/users/mralexgray/repos");
    const response = await myPosts.json();
    //console.log(response);
    
    for(let i = 0; i< response.length; i++){
        const post = new Post({
             
             id: response[i]['id'],
       name: response[i]['name'],
       html_url: response[i]['html_url'],
       description: response[i]['description'] || 'No description available',
       created_at: response[i]['created_at'],
       open_issues: response[i]['open_issues'],
       watchers: response[i]['watchers'],
       owner: {
         id: response[i]['owner']['id'],
         avatar_url: response[i]['owner']['avatar_url'],
         html_url: response[i]['owner']['html_url'],
         type: parseInt(response[i]['owner']['type']) || 0,
         site_admin: response[i]['owner']['site_admin'],
         
     }
          });
         post.save();
     }
 }
 getPosts()  ;

// Your existing code for fetching and saving posts

// Define a route to fetch and display a list of API names
app.get('/', async (req, res) => {
    try {
        const posts = await Post.find(); // Fetch posts from MongoDB

        const apiListHTML = posts.map(post => `
            <div style="display:flex; align-items:center; margin-bottom: 20px;">
                <img src="${post.owner.avatar_url}" alt="${post.name}" style="width: 50px; height: 50px; border-radius: 50%; margin-right: 15px;">
                <div>
                    <h3 style="margin: 0;"><a href="/description/${post._id}" style="text-decoration: none; color: #333;">${post.name}</a></h3>
                    
                </div>
            </div>
        `).join('');

        const htmlResponse = `
            <html>
                <head>
                    <title>Data From Github</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            margin: 0;
                            padding: 20px;
                            background-color: #f4f4f4;
                        }
                        h3 {
                            margin-bottom: 5px;
                        }
                        p {
                            color: #666;
                            margin-top: 5px;
                        }
                    </style>
                </head>
                <body>
                    <h1 style="text-align: center;">Data From Github</h1>
                    <div>${apiListHTML}</div>
                </body>
            </html>
        `;

        res.send(htmlResponse);
    } catch (err) {
        res.status(500).send(err.message);
    }
});


// Define a route to display the detailed description of a specific API
app.get('/description/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId); // Fetch the specific post from MongoDB
        if (!post) {
            return res.status(404).send('API not found');
        }
        res.send(`
            <html>
                <head>
                    <title>${post.name} Details</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            padding: 20px;
                            background-color: #f9f9f9;
                        }
                        h1 {
                            color: #333;
                            margin-bottom: 10px;
                        }
                        p {
                            color: #555;
                            font-weight: bold;
                            font-size: 16px;
                            margin-bottom: 5px;
                        }
                    </style>
                </head>
                <body>
                    <h1>${post.name}</h1>
                    <p style="color: #777;">Description:</p>
                    <p style="color: #444;">${post.description}</p>
                    <!-- Other details can be added and styled similarly -->
                </body>
            </html>
        `);
    } catch (err) {
        res.status(500).send(err.message);
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
