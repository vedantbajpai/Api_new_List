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

async function getPosts() {
    try {
        const response = await fetch("https://api.github.com/users/mralexgray/repos");
        const data = await response.json();

        const postsToInsert = data.map(item => ({
            id: item.id,
            name: item.name,
            html_url: item.html_url,
            description: item.description || 'No description available',
            
            created_at: item.created_at,
            open_issues: item.open_issues,
            watchers: item.watchers,
            owner: {
                id: item.owner.id,
                avatar_url: item.owner.avatar_url,
                html_url: item.owner.html_url,
                type: parseInt(item.owner.type) || 0,
                site_admin: item.owner.site_admin
            }
        }));

        // Use insertMany to batch insert posts into the database
        await Post.insertMany(postsToInsert, { maxTimeMS: 30000 }); // Timeout set to 30 seconds

        await Post.insertMany(postsToInsert, { writeConcern: { w: "majority" } });

        //await Post.insertMany(postsToInsert);
        console.log('Posts inserted successfully.');
    } catch (error) {
        console.error('Error fetching and inserting posts:', error);
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
