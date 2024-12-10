const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post( "/register", ( req,res ) => {

    const { username, password } = req.body;

	if( !username || !password ) {
		return res.status( 400 ).json( { message: "All fields are required." } );
	}

	if( !isValid( username ) ) {
		return res.status( 409 ).json( { message: "Username already exists." } );
	}

	users.push( { username, password } );

	return res.status( 201 ).json( { message: `User '${username}' registered successfully.` } );

} );


public_users.get( '/', ( req, res ) => {
    return res.status( 200 ).json( books );
} );


public_users.get( '/isbn/:isbn', ( req, res ) => {

    const { isbn } = req.params;

    if( !books[ isbn ] ) {
        return res.status( 404 ).json( { message: "Book not found." } );
    }

    return res.status( 200 ).json( books[ isbn ] );

} );
  

public_users.get( '/author/:author', ( req, res ) => {
    
    const { author } = req.params;

    const filteredBooks = Object.values( books ).filter( book => book.author.toLowerCase() === author.toLowerCase() );

    if( filteredBooks.length === 0 ) {
        return res.status( 404 ).json( { message: "No books found by this author." } );
    }

    return res.status( 200 ).json( filteredBooks );

} );


public_users.get( '/title/:title', ( req, res ) => {
    
    const { title } = req.params;
    
    const filteredBooks = Object.values( books ).filter( book => book.title.toLowerCase() === title.toLowerCase() );

    if( filteredBooks.length === 0 ) {
        return res.status( 404 ).json( { message: "No books found with this title." } );
    }

    return res.status( 200 ).json( filteredBooks );

} );


public_users.get( '/review/:isbn', ( req, res ) => {

    const { isbn } = req.params;

    if( !books[ isbn ] ) {
        return res.status( 404 ).json( { message: "Book not found." } );
    }

    return res.status( 200 ).json( books[ isbn ].reviews );

} );


module.exports.general = public_users;
